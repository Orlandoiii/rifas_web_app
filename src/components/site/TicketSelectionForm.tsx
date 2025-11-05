import { useMemo, useState } from 'react';
import { Button } from '../lib/components/button';
import { Loader } from '../lib/components/loader';
import type { RaffleDetail, RaffleTicket } from '../../types/raffles';

interface TicketSelectionFormProps {
    detail: RaffleDetail | undefined;
    loadingTickets: boolean;
    errorTickets: boolean;
    selected: number[];
    onSelectedChange: (selected: number[]) => void;
}

export default function TicketSelectionForm({
    detail,
    loadingTickets,
    errorTickets,
    selected,
    onSelectedChange
}: TicketSelectionFormProps) {
    const [page, setPage] = useState(0);
    const [jumpValue, setJumpValue] = useState('');
    const [showSelected, setShowSelected] = useState(false);
    const pageSize = 50;

    const availableTickets = useMemo(
        () => (detail?.tickets || []).filter(n => n.status === 'available'),
        [detail]
    );

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(((detail?.tickets?.length) || 0) / pageSize)),
        [detail]
    );

    const pageTickets = useMemo(() => {
        const tickets = detail?.tickets || [];
        const start = page * pageSize;
        return tickets.slice(start, start + pageSize);
    }, [detail, page]);

    const toggleTicket = (ticket: RaffleTicket) => {
        if (ticket.status !== 'available') return;
        onSelectedChange(
            selected.includes(ticket.number)
                ? selected.filter(x => x !== ticket.number)
                : [...selected, ticket.number]
        );
    };

    const pickRandom = (count = 1) => {
        if (!availableTickets.length) return;
        const pool = availableTickets.map(n => n.number).filter(n => !selected.includes(n));
        const picks: number[] = [];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            picks.push(pool.splice(idx, 1)[0]);
        }
        onSelectedChange([...selected, ...picks]);
    };

    const jumpToNumber = () => {
        const n = parseInt(jumpValue, 10);
        if (!isNaN(n) && detail?.tickets) {
            const ticket = detail.tickets.find(t => t.number === n);
            if (ticket) {
                const ticketIndex = detail.tickets.indexOf(ticket);
                setPage(Math.floor(ticketIndex / pageSize));
                if (ticket.status === 'available' && !selected.includes(n)) {
                    onSelectedChange([...selected, n]);
                }
            }
        }
    };

    const TicketBadge = ({ ticket }: { ticket: RaffleTicket }) => {
        const isSelected = selected.includes(ticket.number);
        const base = 'w-12 h-10 md:w-14 md:h-12 rounded-md flex items-center justify-center text-sm md:text-base font-semibold transition-colors';
        let cls = '';
        if (ticket.status === 'sold') cls = 'bg-border-light text-text-muted cursor-not-allowed';
        else if (ticket.status === 'reserved') cls = 'bg-bg-tertiary text-text-secondary cursor-not-allowed';
        else if (isSelected) cls = 'bg-selected text-white ring-2 ring-selected/60';
        else cls = 'bg-bg-secondary text-text-primary hover:bg-selected/20 cursor-pointer';

        return (
            <button
                className={`${base} ${cls}`}
                onClick={() => toggleTicket(ticket)}
                disabled={ticket.status !== 'available'}
            >
                {ticket.number}
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <img
                    src={detail?.coverImageUrl}
                    alt={detail?.title}
                    className="w-full md:w-72 h-40 md:h-44 object-cover rounded-lg border border-border-light"
                />
                <div className="flex-1">
                    <p className="text-text-secondary text-sm">{detail?.shortDescription}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <div className="text-selected font-semibold">
                            Precio: {detail?.price.toFixed(2)}{detail?.currency}
                        </div>
                        <div className="text-text-secondary text-sm">
                            Seleccionados: <span className="text-text-primary font-semibold">{selected.length}</span>
                        </div>
                        <div className="text-text-secondary text-sm">
                            Total: <span className="text-text-primary font-semibold">
                                {((detail?.price || 0) * selected.length).toFixed(2)}{detail?.currency}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 w-full">
                        <div className="relative w-full">
                            <Button variant="secondary" onClick={() => setShowSelected(s => !s)}>
                                Seleccionados ({selected.length})
                            </Button>
                            {showSelected && (
                                <div className="mt-2 w-full max-h-56 overflow-auto bg-bg-secondary border border-border-light rounded-lg shadow-lg p-2 z-30">
                                    {selected.length === 0 ? (
                                        <div className="text-text-secondary text-sm">Sin selección</div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selected.sort((a, b) => a - b).map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => onSelectedChange(selected.filter(x => x !== num))}
                                                    className="px-2 py-1 bg-selected text-white rounded-md text-xs hover:opacity-90"
                                                >
                                                    #{num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => pickRandom(1)} disabled={loadingTickets}>
                            Aleatorio x1
                        </Button>
                        <Button variant="outline" onClick={() => pickRandom(5)} disabled={loadingTickets}>
                            Aleatorio x5
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onSelectedChange([])}
                            disabled={loadingTickets || selected.length === 0}
                        >
                            Limpiar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border border-border-light rounded-xl p-3 bg-bg-primary">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                    <div className="text-text-secondary text-sm">Página {page + 1} / {totalPages}</div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={detail?.initialTicket || 1}
                            max={(detail ? detail.initialTicket + detail.ticketsTotal - 1 : 1)}
                            value={jumpValue}
                            onChange={(e) => setJumpValue(e.target.value)}
                            disabled={loadingTickets}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    jumpToNumber();
                                }
                            }}
                            placeholder="Ir a número..."
                            className="no-spinner ios-zoom-fix bg-bg-secondary border border-border-light rounded-md px-3 py-2 text-base sm:text-sm text-text-primary w-40 focus:border-selected focus:outline-none"
                        />
                        <Button variant="secondary" size="sm" onClick={jumpToNumber}>
                            Ir
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={loadingTickets || page === 0}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={loadingTickets || page >= totalPages - 1}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
                <div className="pb-4 md:pb-0 min-h-[200px] flex items-center justify-center">
                    {loadingTickets ? (
                        <Loader size="md" />
                    ) : errorTickets ? (
                        <div className="text-center py-8">
                            <p className="text-text-secondary text-sm">Error al cargar los tickets.</p>
                            <p className="text-text-muted text-xs mt-1">Por favor, intenta nuevamente más tarde.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 place-items-center w-full">
                            {pageTickets.map(ticket => (
                                <TicketBadge key={ticket.number} ticket={ticket} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

