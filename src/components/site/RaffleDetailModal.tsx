import React, { useEffect, useState } from 'react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import { Stepper } from '../lib/components/stepper';
import type { Step } from '../lib/components/stepper';
import TicketSelectionForm from './TicketSelectionForm';
import UserDataForm from './UserDataForm';
import SypagoDebit, { type SypagoDebitPayload } from './payments/SypagoDebit';
import OTPVerification from './payments/OTPVerification';
import { useRaffleDetail, useCreateParticipant } from '../../hooks';
import type { RaffleSummary } from '../../types/raffles';

interface RaffleDetailModalProps {
    raffle: RaffleSummary | null;
    open: boolean;
    onClose: () => void;
}

export default function RaffleDetailModal({ raffle, open, onClose }: RaffleDetailModalProps) {
    const { data: detail, isLoading: loadingTickets, isError: errorTickets } = useRaffleDetail(open ? raffle : null);
    const createParticipant = useCreateParticipant();
    const [selected, setSelected] = useState<number[]>([]);
    const [otpCountdown, setOtpCountdown] = useState(0);

    useEffect(() => {
        if (!open) return;
        setSelected([]);
        setOtpCountdown(0);
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

    // Función para reservar tickets cuando el usuario avanza del paso 2 al 3
    const handleReserveTickets = async (): Promise<void> => {
        if (!raffle?.id || selected.length === 0) {
            throw new Error('No hay tickets seleccionados para reservar');
        }

        const response = await createParticipant.mutateAsync({
            raffleId: raffle.id,
            name: checkout.buyer.name,
            email: checkout.buyer.email,
            phone: checkout.buyer.phone,
            ticketNumber: selected,
        });

        // Verificar que se reservaron los tickets correctamente
        if (!response.reserveTickets || response.reserveTickets.length === 0) {
            throw new Error('No se pudieron reservar los tickets seleccionados');
        }
    };

    // Función para generar OTP cuando el usuario avanza del paso 3 al 4
    const handleGenerateOTP = async (): Promise<void> => {
        // TODO: Implementar llamada al backend para generar OTP
        // const response = await generateOTP({ ...checkout.payment });
        
        // Simular generación de OTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Iniciar countdown de 26 segundos
        setOtpCountdown(26);
    };

    // Función para reenviar OTP
    const handleResendOTP = async () => {
        await handleGenerateOTP();
    };

    // Función para verificar OTP
    const handleVerifyOTP = async (otp: string): Promise<void> => {
        // TODO: Implementar llamada al backend para verificar OTP y procesar pago
        console.log('Verificando OTP:', otp);
        console.log('Datos de pago:', checkout.payment);
        
        // Simular verificación
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Si todo está bien, cerrar modal
        // onClose();
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
    );
}


