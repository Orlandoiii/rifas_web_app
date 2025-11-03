import { useMemo, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { Loader } from '../lib/components/loader';
import RaffleCard from './RaffleCard';
import RaffleDetailModal from './RaffleDetailModal';
import type { RaffleSummary } from '../../types/raffles';

interface RafflesCarouselProps {
  raffles: RaffleSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function RafflesCarousel({ raffles, isLoading = false, isError = false }: RafflesCarouselProps) {
  const items = useMemo(() => raffles || [], [raffles]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleSummary | null>(null);
  const swipeThreshold = 50;

  const goPrev = () => setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  const goNext = () => setActiveIndex((prev) => (prev + 1) % items.length);

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    if (offset.x < -swipeThreshold) {
      goNext();
    } else if (offset.x > swipeThreshold) {
      goPrev();
    }
  };

  // Carrusel de un solo elemento en todas las resoluciones
  const enableCarousel = items.length >= 1;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 overflow-hidden">
      <h3 className="text-xl font-semibold mb-6">Rifas disponibles</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="md" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-bg-secondary border border-border-light rounded-xl p-6 max-w-xl mx-auto">
          <p className="text-text-secondary text-sm">Error al cargar las rifas.</p>
          <p className="text-text-muted text-xs mt-1">Por favor, intenta recargar la página.</p>
        </div>
      ) : !items.length ? (
        <div className="text-center py-12 bg-bg-secondary border border-border-light rounded-xl p-6 max-w-xl mx-auto">
          <p className="text-text-secondary text-sm">No hay rifas disponibles en este momento.</p>
          <p className="text-text-muted text-xs mt-1">Vuelve pronto para ver nuevas rifas.</p>
        </div>
      ) : (
        <div className="relative w-full mx-auto touch-pan-y overflow-hidden">
        {!enableCarousel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {items.map((r) => (
              <RaffleCard key={r.id} raffle={r} />
            ))}
          </div>
        )}
        {enableCarousel && (
          <motion.div
            className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
          >
            <RaffleCard
              raffle={items[activeIndex]}
              variant="single"
              onDetails={() => setSelectedRaffle(items[activeIndex])}
            />
          </motion.div>
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={() => { goPrev(); }}
              className="absolute left-2 lg:left-0 top-[30%] sm:top-1/2 -translate-y-1/2 z-20 w-10 
              h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-bg-secondary/70 
              border border-border-light hover:bg-bg-secondary transition-colors"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              onClick={() => { goNext(); }}
              className="absolute right-2 lg:right-0 top-[30%] sm:top-1/2 -translate-y-1/2 z-20 w-10 
              h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-bg-secondary/70 
              border border-border-light hover:bg-bg-secondary transition-colors"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </>
        )}

        {items.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${i === activeIndex ? 'bg-selected' : 'bg-text-muted/40'}`}
                aria-label={`Ir a la rifa ${i + 1}`}
              />
            ))}
          </div>
        )}
        </div>
      )}
      
      <RaffleDetailModal
        raffle={selectedRaffle}
        open={!!selectedRaffle}
        onClose={() => setSelectedRaffle(null)}
      />
    </section>
  );
}


