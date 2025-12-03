import React, { useEffect, useState } from 'react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import { Stepper } from '../lib/components/stepper';
import type { Step } from '../lib/components/stepper';
import TicketSelectionForm from './TicketSelectionForm';
import UserDataForm from './UserDataForm';
import TermsAndConditions from './TermsAndConditions';
import SypagoDebit, { type SypagoDebitPayload } from './payments/SypagoDebit';
import OTPVerification from './payments/OTPVerification';
import PurchaseSuccessView, { type PurchaseSuccessData } from './PurchaseSuccessView';
import { useRaffleDetail, useCreateParticipant, useParticipant, usePurchases } from '../../hooks';
import type { RaffleSummary } from '../../types/raffles';
import { requestDebitOtp, processDebit, pollTransactionStatus } from '../../services/payments';

interface RaffleDetailModalProps {
    raffle: RaffleSummary | null;
    open: boolean;
    onClose: () => void;
}

export default function RaffleDetailModal({ raffle, open, onClose }: RaffleDetailModalProps) {
    const { data: detail, isLoading: loadingTickets,
        isError: errorTickets } = useRaffleDetail(open ? raffle : null);

    const createParticipant = useCreateParticipant();

    const { participant, saveParticipant, updateParticipant, clearParticipant } = useParticipant();
    const { savePurchase } = usePurchases();

    const [selected, setSelected] = useState<number[]>([]);

    const [otpCountdown, setOtpCountdown] = useState(0);

    const [bookingId, setBookingId] = useState<string | null>(null);

    const [purchaseSuccess, setPurchaseSuccess] = useState<PurchaseSuccessData | null>(null);

  
    // Limpiar estado cuando el modal se ABRE (no cuando se cierra)
    // Esto permite que purchaseSuccess persista después de cerrar el modal de detalle
    useEffect(() => {
        if (open) {
            setSelected([]);
            setOtpCountdown(0);
            setBookingId(null);
            // NO limpiar purchaseSuccess aquí - se limpia cuando se cierra la vista de éxito
        }
    }, [open, raffle?.id]);

    // Countdown para OTP
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    type CheckoutData = {
        buyer: { id: string; name: string; phone: string; email: string };
        acceptedTerms: boolean;
        payment: SypagoDebitPayload;
    };

    const [checkout, setCheckout] = React.useState<CheckoutData>({
        buyer: { id: '', name: '', phone: '', email: '' },
        acceptedTerms: false,
        payment: {
            bankCode: '',
            phone: '',
            docType: 'V',
            docNumber: ''
        },
    });

    // Cargar datos del participante guardado cuando se abre el modal
    useEffect(() => {
        if (open && participant) {
            setCheckout(prev => ({
                ...prev,
                buyer: {
                    id: participant.id,
                    name: participant.name,
                    phone: participant.phone,
                    email: participant.email,
                }
            }));
        }
    }, [open, participant]);

    // Función para reservar tickets cuando el usuario avanza del paso 2 al 3
    const handleReserveTickets = async (): Promise<void> => {
        if (!raffle?.id || selected.length === 0) {
            throw new Error('No hay tickets seleccionados para reservar');
        }

        const requestData = {
            raffleId: raffle.id,
            id: checkout.buyer.id,
            name: checkout.buyer.name,
            email: checkout.buyer.email,
            phone: checkout.buyer.phone,
            ticketNumber: selected,
            ...(participant?.participantId && { participantId: participant.participantId }),
        };

        const response = await createParticipant.mutateAsync(requestData);

        // Verificar que se reservaron los tickets correctamente
        if (!response.reserveTickets || response.reserveTickets.length === 0) {
            throw new Error('No se pudieron reservar los tickets seleccionados');
        }

        // Verificar que se reservaron TODOS los tickets solicitados
        if (response.reserveTickets.length !== selected.length) {
            throw new Error(
                `Solo se pudieron reservar ${response.reserveTickets.length} de ${selected.length} tickets. Por favor, intente nuevamente.`
            );
        }

        // Verificar que se recibió el bookingId
        if (!response.bookingId) {
            throw new Error('No se recibió el ID de reserva del servidor');
        }

        // Guardar el bookingId para los siguientes pasos
        setBookingId(response.bookingId);

        // Guardar o actualizar datos del participante
        if (!participant) {
            // Primera vez: guardar los datos del usuario con ID temporal
            const participantData = {
                participantId: `participant-${Date.now()}`, // Generar ID temporal
                id: checkout.buyer.id,
                name: checkout.buyer.name,
                phone: checkout.buyer.phone,
                email: checkout.buyer.email,
            };
            saveParticipant(participantData);
        } else {
            // Verificar si los datos cambiaron y actualizarlos
            const hasChanges =
                participant.id !== checkout.buyer.id ||
                participant.name !== checkout.buyer.name ||
                participant.phone !== checkout.buyer.phone ||
                participant.email !== checkout.buyer.email;

            if (hasChanges) {
                updateParticipant({
                    id: checkout.buyer.id,
                    name: checkout.buyer.name,
                    phone: checkout.buyer.phone,
                    email: checkout.buyer.email,
                });
            }
        }
    };

    // Función para generar OTP cuando el usuario avanza del paso 3 al 4
    const handleGenerateOTP = async (): Promise<void> => {
        if (!raffle || !detail) {
            throw new Error('No hay información de la rifa disponible');
        }

        // Verificar que existe el bookingId
        if (!bookingId) {
            throw new Error('No hay una reserva activa. Por favor, intente nuevamente desde el inicio.');
        }

        // Calcular monto total
        const amount = (detail.price || 0) * selected.length;

        // Llamar al servicio para solicitar OTP
        await requestDebitOtp({
            booking_id: bookingId,
            document_letter: checkout.payment.docType,
            document: checkout.payment.docNumber,
            bank_code: checkout.payment.bankCode,
            account_number: checkout.payment.phone,
            amount: amount,
            currency: detail.currency || 'USD',
        });

        // Iniciar countdown de 26 segundos
        setOtpCountdown(26);
    };

    // Función para reenviar OTP
    const handleResendOTP = async () => {
        await handleGenerateOTP();
    };

    // Función para limpiar datos guardados
    const handleClearUserData = () => {
        clearParticipant();
        setCheckout(prev => ({
            ...prev,
            buyer: { id: '', name: '', phone: '', email: '' }
        }));
    };

    // Función para verificar OTP y procesar el débito
    const handleVerifyOTP = async (
        otp: string,
        onStatusUpdate?: (status: string) => void
    ): Promise<void> => {
        // Validar que tenemos todos los datos necesarios
        if (!raffle) {
            throw new Error('No hay información de la rifa');
        }
        if (!detail) {
            throw new Error('No hay información del detalle de la rifa');
        }
        if (!bookingId) {
            throw new Error('No hay una reserva activa. Por favor, intente nuevamente desde el inicio.');
        }
        if (!participant) {
            throw new Error('No hay información del participante');
        }

        // Calcular monto total
        const amount = (detail.price || 0) * selected.length;

        // 1. Procesar el débito con el bookingId de la reserva
        // El bookingId se obtuvo al reservar los tickets y se mantiene durante todo el flujo
        const debitResponse = await processDebit({
            booking_id: bookingId,  // bookingId de la reserva (guardado en estado)
            participant_id: participant.participantId,
            raffle_id: raffle.id,
            tickets: selected,
            receiver_name: checkout.buyer.name,
            receiver_otp: otp,
            receiver_document_type: checkout.payment.docType,
            receiver_document_number: checkout.payment.docNumber,
            receiver_bank_code: checkout.payment.bankCode,
            receiver_account_number: checkout.payment.phone,
            amount: amount,
            currency: detail.currency || 'USD',
        });

        // Validar que recibimos el transaction_id de SyPago
        // Este ID identifica el intento de débito en SyPago
        if (!debitResponse.transaction_id) {
            console.log('No se recibió el ID de transacción del servidor');
            throw new Error('No se recibió el ID de transacción del servidor');
        }

        console.log('Transaction ID recibido de SyPago:', debitResponse.transaction_id);
        console.log('Booking ID usado:', bookingId);

        // 2. Iniciar polling del estado de la transacción
        // Importante: Usar el mismo bookingId de la reserva, no el de la respuesta
        // El bookingId se mantiene constante desde la reserva hasta el cierre del modal
        const result = await pollTransactionStatus(
            debitResponse.transaction_id,
            bookingId,  // Mismo bookingId de la reserva
            onStatusUpdate
        );

        // 3. Manejar el resultado final
        if (result.finalStatus === 'ACCP') {
            // Pago aceptado - preparar datos para la vista de éxito
            // Manejar ambos formatos posibles del backend
            const blessNumbers = result.bless_numbers || result.blessed_numbers || result.blessNumbers || result.blessedNumbers || [];
            
            // Log para debug
            console.log('Pago exitoso. Referencia:', result.ref_ibp);
            console.log('Bless numbers recibidos:', blessNumbers);
            console.log('Result completo:', result);
            
            const successData: PurchaseSuccessData = {
                transactionId: result.transaction_id,
                refIbp: result.ref_ibp,
                bookingId: result.booking_id,
                raffle: raffle,
                buyer: {
                    name: checkout.buyer.name,
                    email: checkout.buyer.email,
                    phone: checkout.buyer.phone,
                    id: checkout.buyer.id,
                },
                tickets: selected,
                blessNumbers: blessNumbers, // Agregar bless numbers si vienen del backend
                amount: amount,
                currency: detail.currency || 'USD',
            };

            // Guardar la compra en localStorage
            savePurchase(successData);

            // Primero cerrar el modal de detalle
            onClose();
            
            // Esperar a que el modal se cierre completamente (animación) antes de mostrar el de éxito
            setTimeout(() => {
                setPurchaseSuccess(successData);
            }, 300);
        } else if (result.finalStatus === 'RJCT') {
            // Pago rechazado - incluir código de rechazo si está disponible
            let errorMessage = result.rsn || 'El pago fue rechazado. Por favor, verifique sus datos e intente nuevamente.';
            
            // Si hay código de rechazo, incluirlo en el mensaje para que OTPVerification pueda buscarlo
            if (result.reject_code) {
                errorMessage = `El pago fue rechazado. Código: ${result.reject_code}. ${errorMessage}`;
            } else {
                // Intentar extraer código del rsn si tiene formato "code: XX" o similar
                const codeMatch = result.rsn?.match(/code:\s*([A-Z0-9]+)/i) || 
                                 result.rsn?.match(/código:\s*([A-Z0-9]+)/i);
                if (codeMatch && codeMatch[1]) {
                    errorMessage = `El pago fue rechazado. Código: ${codeMatch[1]}. ${errorMessage}`;
                }
            }
            
            throw new Error(errorMessage);
        } else if (result.finalStatus === 'TIMEOUT') {
            // Timeout - mostrar mensaje especial
            throw new Error(result.rsn || 'El tiempo de espera ha expirado. Por favor, contacte con soporte.');
        }
    };

    const steps: Step<CheckoutData>[] = [
        {
            id: 'numbers',
            title: 'Selecciona tus números',
            validate: () => !loadingTickets && selected.length > 0,
            render: () => (
                <TicketSelectionForm
                    detail={detail}
                    loadingTickets={loadingTickets}
                    errorTickets={errorTickets}
                    selected={selected}
                    onSelectedChange={setSelected}
                />
            )
        },
        {
            id: 'userdata',
            title: 'Tus datos',
            validate: (d) => {
                // Validaciones estrictas
                const id = d.buyer.id?.trim() || '';
                const name = d.buyer.name?.trim() || '';
                const phone = d.buyer.phone?.trim() || '';
                const email = d.buyer.email?.trim() || '';
                
                // Cédula: solo números, 6-10 dígitos
                if (!id || !/^\d+$/.test(id) || id.length < 6 || id.length > 10) {
                    return false;
                }
                
                // Nombre: solo letras, máximo un espacio
                const spaceCount = (name.match(/\s/g) || []).length;
                if (!name || spaceCount > 1 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
                    return false;
                }
                
                // Teléfono: regex específico
                const PHONE_REGEX = /^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$/;
                if (!phone || !PHONE_REGEX.test(phone)) {
                    return false;
                }
                
                // Email: formato válido
                const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !EMAIL_REGEX.test(email)) {
                    return false;
                }
                
                return true;
            },
            onNext: async () => {
                // Reservar tickets antes de avanzar al paso de pago
                await handleReserveTickets();
            },
            render: ({ data, setData, isProcessing, onSubmitAttempt }) => (
                <UserDataForm
                    raffleTitle={detail?.title || ''}
                    price={detail?.price || 0}
                    currency={detail?.currency || 'USD'}
                    selectedNumbers={selected}
                    buyer={data.buyer}
                    onChange={(buyer) => setData(prev => ({ ...prev, buyer }))}
                    disabled={isProcessing}
                    onClearData={handleClearUserData}
                    hasStoredData={!!participant}
                    onSubmitAttempt={onSubmitAttempt}
                />
            )
        },
        {
            id: 'terms',
            title: 'Términos y Condiciones',
            validate: (d) => {
                // Validar que se hayan aceptado los términos
                return d.acceptedTerms === true;
            },
            render: ({ data, setData, isProcessing, onSubmitAttempt }) => (
                <TermsAndConditions
                    accepted={data.acceptedTerms}
                    onChange={(accepted) => setData(prev => ({ ...prev, acceptedTerms: accepted }))}
                    disabled={isProcessing}
                    onSubmitAttempt={onSubmitAttempt}
                />
            )
        },
        {
            id: 'payment',
            title: 'Pago',
            onNext: async () => {
                // Generar OTP antes de avanzar al paso de verificación
                await handleGenerateOTP();
            },
            render: ({ data, setData, isProcessing, onSubmitAttempt }) => (
                <SypagoDebit
                    raffleTitle={detail?.title || ''}
                    selectedNumbers={selected}
                    price={detail?.price || 0}
                    currency={detail?.currency || 'USD'}
                    payload={data.payment}
                    onChange={(payment) => setData(prev => ({ ...prev, payment }))}
                    disabled={isProcessing}
                    onSubmitAttempt={onSubmitAttempt}
                />
            ),
            validate: (d) => {
                // Validaciones estrictas
                const bankCode = d.payment.bankCode?.trim() || '';
                const phone = d.payment.phone?.trim() || '';
                const docNumber = d.payment.docNumber?.trim() || '';
                const docType = d.payment.docType;
                
                if (!bankCode) {
                    return false;
                }
                
                // Teléfono: regex específico
                const PHONE_REGEX = /^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$/;
                if (!phone || !PHONE_REGEX.test(phone)) {
                    return false;
                }
                
                // Documento: validación según tipo
                if (!docNumber) {
                    return false;
                }
                if (docType !== 'P' && !/^\d+$/.test(docNumber)) {
                    return false;
                }
                if (docType === 'V' || docType === 'E') {
                    if (docNumber.length < 6 || docNumber.length > 10) {
                        return false;
                    }
                } else if (docType === 'J') {
                    if (docNumber.length < 8 || docNumber.length > 12) {
                        return false;
                    }
                }
                
                return true;
            }
        },
        {
            id: 'otp',
            title: 'Verificación',
            render: ({ isProcessing }) => (
                <OTPVerification
                    raffleTitle={detail?.title || ''}
                    selectedNumbers={selected}
                    price={detail?.price || 0}
                    currency={detail?.currency || 'USD'}
                    onVerify={handleVerifyOTP}
                    disabled={isProcessing}
                    countdown={otpCountdown}
                    onResend={handleResendOTP}
                />
            )
        }
    ];

    return (
        <>
        <Modal open={open} onClose={onClose} size="xl" title={detail?.title || 'Detalle de rifa'} lockBodyScroll closeOnBackdropClick={false}>
            <Stepper<CheckoutData>
                steps={steps}
                data={checkout}
                onDataChange={(u) => setCheckout(u)}
                finishLabel="Verificar"
                onFinish={() => { /* El OTP se maneja en el componente */ }}
                renderFooter={({ current, total, canNext, goBack, goNext, isProcessing }) => {
                    // En el último paso (OTP), solo mostrar botón Atrás
                    if (current === total - 1) {
                        return (
                            <div className="mt-6 flex items-center justify-between">
                                <Button variant="secondary" onClick={goBack} disabled={isProcessing}>
                                    Atrás
                                </Button>
                                <div className="flex-1" />
                            </div>
                        );
                    }

                    return (
                        <div className="mt-6 flex items-center justify-between">
                            <Button variant="secondary" onClick={goBack} disabled={current === 0 || isProcessing}>
                                Atrás
                            </Button>
                            <div className="flex-1" />
                            <Button onClick={goNext} disabled={isProcessing}>
                                {isProcessing ? 'Procesando...' : 'Continuar'}
                            </Button>
                        </div>
                    );
                }}
            />
        </Modal>

        {/* Vista de compra exitosa */}
        <PurchaseSuccessView
            data={purchaseSuccess}
            open={!!purchaseSuccess}
            onClose={() => setPurchaseSuccess(null)}
        />
    </>
    );
}


