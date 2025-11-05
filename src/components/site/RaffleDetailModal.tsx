import React, { useEffect, useState } from 'react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import { Stepper } from '../lib/components/stepper';
import type { Step } from '../lib/components/stepper';
import TicketSelectionForm from './TicketSelectionForm';
import UserDataForm from './UserDataForm';
import SypagoDebit, { type SypagoDebitPayload } from './payments/SypagoDebit';
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

    useEffect(() => {
        if (!open) return;
        setSelected([]);
    }, [open, raffle?.id]);

    type CheckoutData = {
        buyer: { id: string; name: string; phone: string; email: string };
        payment: SypagoDebitPayload;
    };

    const [checkout, setCheckout] = React.useState<CheckoutData>({
        buyer: { id: '', name: '', phone: '', email: '' },
        payment: {
            bankCode: '',
            mode: 'phone',
            phone: '',
            account: '',
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
                d.payment.docNumber &&
                ((d.payment.mode === 'phone' && d.payment.phone) || (d.payment.mode === 'account' && d.payment.account))
            )
        }
    ];

    return (
        <Modal open={open} onClose={onClose} size="xl" title={detail?.title || 'Detalle de rifa'} lockBodyScroll closeOnBackdropClick={false}>
            <Stepper<CheckoutData>
                steps={steps}
                data={checkout}
                onDataChange={(u) => setCheckout(u)}
                finishLabel="Pagar"
                onFinish={() => { /* TODO: enviar pago */ }}
                renderFooter={({ current, total, canNext, goBack, goNext, isProcessing }) => (
                    <div className="mt-6 flex items-center justify-between">
                        <Button variant="secondary" onClick={goBack} disabled={current === 0 || isProcessing}>
                            Atrás
                        </Button>
                        <div className="flex-1" />
                        <Button onClick={goNext} disabled={!canNext || isProcessing}>
                            {isProcessing ? 'Procesando...' : (current === total - 1 ? 'Pagar' : 'Continuar')}
                        </Button>
                    </div>
                )}
            />
        </Modal>
    );
}


