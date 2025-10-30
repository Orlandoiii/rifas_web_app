import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import { Stepper } from '../lib/components/stepper';
import type { Step } from '../lib/components/stepper';
import UserDataForm from './UserDataForm';
import { rafflesService } from '../../services/raffles';
import type { RaffleDetail, RaffleNumber } from '../../types/raffles';

interface RaffleDetailModalProps {
    raffleId: string | null;
    open: boolean;
    onClose: () => void;
}

export default function RaffleDetailModal({ raffleId, open, onClose }: RaffleDetailModalProps) {

    const [detail, setDetail] = useState<RaffleDetail | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState(0);
    const pageSize = 50;
    const [jumpValue, setJumpValue] = useState('');
    const [showSelected, setShowSelected] = useState(false);

    console.log("Renderizando Detalle de Rifa")

    useEffect(() => {
        if (!open || !raffleId) return;
        setSelected([]);
        setPage(0);
        rafflesService.getRaffleDetail(raffleId).then(setDetail);
    }, [open, raffleId]);

    const availableNumbers = useMemo(() => (detail?.numbers || []).filter(n => n.status === 'available'), [detail]);
    const totalPages = useMemo(() => Math.max(1, Math.ceil(((detail?.numbers?.length) || 0) / pageSize)), [detail]);
    const pageNumbers = useMemo(() => {
        const nums = detail?.numbers || [];
        const start = page * pageSize;
        return nums.slice(start, start + pageSize);
    }, [detail, page]);


    const toggleNumber = (n: RaffleNumber) => {
        if (n.status !== 'available') return;
        setSelected(prev => prev.includes(n.number) ? prev.filter(x => x !== n.number) : [...prev, n.number]);
    };

    const pickRandom = (count = 1) => {
        if (!availableNumbers.length) return;
        const pool = availableNumbers.map(n => n.number).filter(n => !selected.includes(n));
        const picks: number[] = [];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            picks.push(pool.splice(idx, 1)[0]);
        }
        setSelected(prev => [...prev, ...picks]);
    };

    const NumberBadge = ({ n }: { n: RaffleNumber }) => {
        const isSelected = selected.includes(n.number);
        const base = 'w-12 h-10 md:w-14 md:h-12 rounded-md flex items-center justify-center text-sm md:text-base font-semibold transition-colors';
        let cls = '';
        if (n.status === 'sold') cls = 'bg-border-light text-text-muted cursor-not-allowed';
        else if (n.status === 'reserved') cls = 'bg-bg-tertiary text-text-secondary cursor-not-allowed';
        else if (isSelected) cls = 'bg-selected text-white ring-2 ring-selected/60';
        else cls = 'bg-bg-secondary text-text-primary hover:bg-selected/20 cursor-pointer';
        return (
            <button className={`${base} ${cls}`} onClick={() => toggleNumber(n)} disabled={n.status !== 'available'}>
                {n.number}
            </button>
        );
    };

    // Stepper integration
    type CheckoutData = { buyer: { id: string; name: string; phone: string; email: string } };
    const [checkout, setCheckout] = React.useState<CheckoutData>({ buyer: { id: '', name: '', phone: '', email: '' } });

    const steps: Step<CheckoutData>[] = [
        {
            id: 'numbers',
            title: 'Selecciona tus números',
            validate: () => selected.length > 0,
            render: () => (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <img src={detail?.coverImageUrl} alt={detail?.title}
                            className="w-full md:w-72 h-40 md:h-44 object-cover rounded-lg border border-border-light" />
                        <div className="flex-1">
                            <p className="text-text-secondary text-sm">{detail?.shortDescription}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                                <div className="text-selected font-semibold">Precio: {detail?.price.toFixed(2)}{detail?.currency}</div>
                                <div className="text-text-secondary text-sm">Seleccionados: <span className="text-text-primary font-semibold">{selected.length}</span></div>
                                <div className="text-text-secondary text-sm">Total: <span className="text-text-primary font-semibold">{((detail?.price || 0) * selected.length).toFixed(2)}{detail?.currency}</span></div>
                            </div>
                            <div className="mt-2 w-full">
                                <div className="relative w-full">
                                    <Button variant="secondary" onClick={() => setShowSelected(s => !s)}>Seleccionados ({selected.length})</Button>
                                    {showSelected && (
                                        <div className="mt-2 w-full max-h-56 overflow-auto bg-bg-secondary border border-border-light rounded-lg shadow-lg p-2 z-30">
                                            {selected.length === 0 ? (
                                                <div className="text-text-secondary text-sm">Sin selección</div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.sort((a, b) => a - b).map(num => (
                                                        <button key={num} onClick={() => setSelected(prev => prev.filter(x => x !== num))}
                                                            className="px-2 py-1 bg-selected text-white rounded-md text-xs hover:opacity-90">#{num}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button onClick={() => pickRandom(1)}>Aleatorio x1</Button>
                                <Button variant="outline" onClick={() => pickRandom(5)}>Aleatorio x5</Button>
                                <Button variant="ghost" onClick={() => setSelected([])}>Limpiar</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border-light rounded-xl p-3 bg-bg-primary">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                            <div className="text-text-secondary text-sm">Página {page + 1} / {totalPages}</div>
                            <div className="flex items-center gap-2">
                                <input type="number" min={1} max={detail?.numbers?.length || 1} value={jumpValue}
                                    onChange={(e) => setJumpValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const n = parseInt(jumpValue, 10);
                                            if (!isNaN(n) && detail?.numbers?.length) {
                                                const max = detail.numbers.length;
                                                if (n >= 1 && n <= max) {
                                                    setPage(Math.floor((n - 1) / pageSize));
                                                    const target = detail.numbers[n - 1];
                                                    if (target && target.status === 'available') setSelected(prev => prev.includes(n) ? prev : [...prev, n]);
                                                }
                                            }
                                        }
                                    }}
                                    placeholder="Ir a número..."
                                    className="no-spinner ios-zoom-fix bg-bg-secondary border border-border-light rounded-md px-3 py-2 text-base sm:text-sm text-text-primary w-40 focus:border-selected focus:outline-none" />
                                <Button variant="secondary" size="sm" onClick={() => {
                                    const n = parseInt(jumpValue, 10);
                                    if (!isNaN(n) && detail?.numbers?.length) {
                                        const max = detail.numbers.length;
                                        if (n >= 1 && n <= max) {
                                            setPage(Math.floor((n - 1) / pageSize));
                                            const target = detail.numbers[n - 1];
                                            if (target && target.status === 'available') setSelected(prev => prev.includes(n) ? prev : [...prev, n]);
                                        }
                                    }
                                }}>Ir</Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Anterior</Button>
                                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Siguiente</Button>
                            </div>
                        </div>
                        <div className="pb-4 md:pb-0">
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 place-items-center">
                                {pageNumbers.map(n => (<NumberBadge key={n.number} n={n} />))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'userdata',
            title: 'Tus datos',
            validate: (d) => Boolean(d.buyer.id && d.buyer.name && d.buyer.phone && d.buyer.email),
            render: ({ data, setData }) => (
                <UserDataForm
                    raffleTitle={detail?.title || ''}
                    price={detail?.price || 0}
                    currency={detail?.currency || 'USD'}
                    selectedNumbers={selected}
                    buyer={data.buyer}
                    onChange={(buyer) => setData(prev => ({ ...prev, buyer }))}
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
                finishLabel="Continuar al pago"
                onFinish={() => {}}
            />
        </Modal>
    );
}


