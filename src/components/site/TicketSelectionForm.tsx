import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
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

// Constantes para virtualización
const TICKET_HEIGHT = 48; // Altura aproximada de cada ticket (h-12 = 48px en md, h-10 = 40px en mobile)
const VISIBLE_ROWS = 6; // Número de filas visibles (aproximadamente 60 tickets en desktop con 10 columnas)
const CONTAINER_HEIGHT = TICKET_HEIGHT * VISIBLE_ROWS; // Altura del contenedor (~288px)
const OVERSCAN_ROWS = 3; // Filas adicionales a renderizar fuera del viewport para scroll suave

export default function TicketSelectionForm({
    detail,
    loadingTickets,
    errorTickets,
    selected,
    onSelectedChange
}: TicketSelectionFormProps) {
    const [jumpValue, setJumpValue] = useState('');
    const [showSelected, setShowSelected] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    const availableTickets = useMemo(
        () => (detail?.tickets || []).filter(n => n.status === 'available'),
        [detail]
    );

    const allTickets = useMemo(() => detail?.tickets || [], [detail]);

    // Calcular qué tickets renderizar basado en el scroll
    // Usamos 10 columnas como base (máximo en desktop) para cálculo conservador
    const ticketsPerRow = 10;
    const rowHeight = TICKET_HEIGHT;
    
    const visibleRange = useMemo(() => {
        if (!allTickets.length) return { start: 0, end: 0, startRow: 0 };
        
        const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
        const endRow = Math.ceil((scrollTop + CONTAINER_HEIGHT) / rowHeight) + OVERSCAN_ROWS;
        
        const start = Math.max(0, startRow * ticketsPerRow);
        const end = Math.min(allTickets.length, endRow * ticketsPerRow);
        
        return { start, end, startRow };
    }, [scrollTop, allTickets.length]);

    const visibleTickets = useMemo(() => {
        return allTickets.slice(visibleRange.start, visibleRange.end);
    }, [allTickets, visibleRange.start, visibleRange.end]);

    // Altura total del contenido virtual
    const totalHeight = useMemo(() => {
        if (!allTickets.length) return CONTAINER_HEIGHT;
        const totalRows = Math.ceil(allTickets.length / ticketsPerRow);
        return totalRows * rowHeight;
    }, [allTickets.length]);

    // Offset superior para el padding virtual
    const offsetY = useMemo(() => {
        return visibleRange.startRow * rowHeight;
    }, [visibleRange.startRow]);

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

    const jumpToNumber = useCallback(() => {
        const n = parseInt(jumpValue, 10);
        if (!isNaN(n) && allTickets.length && scrollContainerRef.current) {
            const ticket = allTickets.find(t => t.number === n);
            if (ticket) {
                const ticketIndex = allTickets.indexOf(ticket);
                const rowIndex = Math.floor(ticketIndex / ticketsPerRow);
                const targetScrollTop = rowIndex * rowHeight;
                
                // Hacer scroll al ticket con comportamiento suave
                scrollContainerRef.current.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
                
                // Seleccionar el ticket si está disponible
                if (ticket.status === 'available' && !selected.includes(n)) {
                    onSelectedChange([...selected, n]);
                }
                
                // Limpiar el input
                setJumpValue('');
            }
        }
    }, [jumpValue, allTickets, selected, onSelectedChange]);

    // Manejar scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Abrir dropdown de seleccionados automáticamente cuando hay tickets seleccionados
    useEffect(() => {
        if (selected.length > 0 && !showSelected) {
            setShowSelected(true);
        }
    }, [selected.length, showSelected]);

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
                    <div className="text-text-secondary text-sm">
                        {allTickets.length > 0 && (
                            <>Total: {allTickets.length} tickets</>
                        )}
                    </div>
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
                        <Button variant="secondary" size="sm" onClick={jumpToNumber} disabled={loadingTickets}>
                            Ir
                        </Button>
                    </div>
                </div>
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="relative overflow-y-auto overflow-x-hidden"
                    style={{ 
                        height: `${CONTAINER_HEIGHT}px`,
                        maxHeight: `${CONTAINER_HEIGHT}px`
                    }}
                >
                    {loadingTickets ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader size="md" />
                        </div>
                    ) : errorTickets ? (
                        <div className="text-center py-8">
                            <p className="text-text-secondary text-sm">Error al cargar los tickets.</p>
                            <p className="text-text-muted text-xs mt-1">Por favor, intenta nuevamente más tarde.</p>
                        </div>
                    ) : allTickets.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-text-secondary text-sm">No hay tickets disponibles.</p>
                        </div>
                    ) : (
                        <div 
                            className="relative"
                            style={{ height: `${totalHeight}px` }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0"
                                style={{ transform: `translateY(${offsetY}px)` }}
                            >
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 place-items-center w-full">
                                    {visibleTickets.map(ticket => (
                                        <TicketBadge key={ticket.number} ticket={ticket} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

