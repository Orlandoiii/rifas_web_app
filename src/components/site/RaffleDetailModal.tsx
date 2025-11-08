import React, { useEffect, useState } from 'react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import { Stepper } from '../lib/components/stepper';
import type { Step } from '../lib/components/stepper';
import TicketSelectionForm from './TicketSelectionForm';
import UserDataForm from './UserDataForm';
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
        payment: SypagoDebitPayload;
    };

    const [checkout, setCheckout] = React.useState<CheckoutData>({
        buyer: { id: '', name: '', phone: '', email: '' },
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
                blessNumbers: result.bless_numbers, // Agregar bless numbers si vienen del backend
                amount: amount,
                currency: detail.currency || 'USD',
            };

            console.log('Pago exitoso. Referencia:', result.ref_ibp);

            // Guardar la compra en localStorage
            savePurchase(successData);

            // Primero cerrar el modal de detalle
            onClose();
            
            // Esperar a que el modal se cierre completamente (animación) antes de mostrar el de éxito
            setTimeout(() => {
                setPurchaseSuccess(successData);
            }, 300);
        } else if (result.finalStatus === 'RJCT') {
            // Pago rechazado - mostrar razón
            throw new Error(result.rsn || 'El pago fue rechazado. Por favor, verifique sus datos e intente nuevamente.');
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
            validate: (d) => Boolean(d.buyer.id && d.buyer.name && d.buyer.phone && d.buyer.email),
            onNext: async () => {
                // Reservar tickets antes de avanzar al paso de pago
                await handleReserveTickets();
            },
            render: ({ data, setData, isProcessing }) => (
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
            render: ({ data, setData, isProcessing }) => (
                <SypagoDebit
                    raffleTitle={detail?.title || ''}
                    selectedNumbers={selected}
                    price={detail?.price || 0}
                    currency={detail?.currency || 'USD'}
                    payload={data.payment}
                    onChange={(payment) => setData(prev => ({ ...prev, payment }))}
                    disabled={isProcessing}
                />
            ),
            validate: (d) => Boolean(
                d.payment.bankCode &&
                d.payment.phone &&
                d.payment.docNumber
            )
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
                            <Button onClick={goNext} disabled={!canNext || isProcessing}>
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


