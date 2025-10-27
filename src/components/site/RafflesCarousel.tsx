import { Button } from '../../components/lib/components/button';
import type { RaffleSummary } from '../../types/raffles';

interface RafflesCarouselProps {
  raffles: RaffleSummary[];
}

export default function RafflesCarousel({ raffles }: RafflesCarouselProps) {
  if (!raffles || raffles.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h3 className="text-xl font-semibold mb-3">Rifas disponibles</h3>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {raffles.map((r) => (
            <article key={r.id} className="min-w-[260px] max-w-[260px] snap-start bg-bg-secondary border border-border-light rounded-xl overflow-hidden shadow">
              <img src={r.coverImageUrl} alt={r.title} className="w-full h-36 object-cover" />
              <div className="p-3">
                <h4 className="font-semibold truncate" title={r.title}>{r.title}</h4>
                <p className="text-text-secondary text-sm line-clamp-2">{r.shortDescription}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-selected font-semibold">{r.price.toFixed(2)} {r.currency}</span>
                  <span className="text-text-muted text-xs">{Math.round((r.ticketsSold/Math.max(1,r.ticketsTotal))*100)}%</span>
                </div>
                <div className="mt-2">
                  <Button className="w-full">Ver detalles</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


