import { useEffect, useState } from 'react';
import { Button } from '../../components/lib/components/button';
import type { RaffleSummary } from '../../types/raffles';

interface RaffleCardProps {
  raffle: RaffleSummary;
  variant?: 'single' | 'carousel';
  onDetails?: (raffle: RaffleSummary) => void;
}

export default function RaffleCard({ raffle: r, variant = 'carousel', onDetails }: RaffleCardProps) {
  const imgW = variant === 'single' ? 'w-[92vw] sm:w-[360px] md:w-[520px]' : 'w-[300px] md:w-[360px]';
  const imgH = variant === 'single' ? 'h-[60vw] sm:h-64 md:h-80' : 'h-52 md:h-64';
  const bodyW = variant === 'single' ? 'w-[92vw] sm:w-[360px] md:w-[520px]' : 'w-[300px] md:w-[360px]';

  const soldPct = Math.round((r.ticketsSold / Math.max(1, r.ticketsTotal)) * 100);
  const available = Math.max(0, r.ticketsTotal - r.ticketsSold);

  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const target = new Date(r.endsAt).getTime();
    const format = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [r.endsAt]);

  return (
    <article className="bg-bg-secondary border border-border-light rounded-xl overflow-hidden shadow">
      <img src={r.coverImageUrl} alt={r.title} className={`${imgW} ${imgH} object-cover`} />
      <div className={`p-4 ${bodyW}`}>
        <h4 className="font-semibold truncate" title={r.title}>{r.title}</h4>
        <p className="text-text-secondary text-sm line-clamp-2">{r.shortDescription}</p>
        <div className="mt-3 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-bg-tertiary/60 backdrop-blur-md border border-border-light/60 rounded-lg px-4 py-2">
            <span className="font-mono text-2xl md:text-3xl lg:text-4xl tracking-widest">{timeLeft}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-selected font-semibold">{r.price.toFixed(2)} {r.currency}</span>
          <span className="text-text-muted text-xs">Termina {new Date(r.endsAt).toLocaleDateString()}</span>
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div className="h-full bg-selected" style={{ width: `${soldPct}%` }} />
          </div>
          <div className="text-text-muted text-xs mt-1">{available.toLocaleString()} disponibles</div>
        </div>
        <div className="mt-3">
          <Button className="w-full" onClick={() => onDetails?.(r)}>Ver detalles</Button>
        </div>
      </div>
    </article>
  );
}


