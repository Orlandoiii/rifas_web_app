import { Button } from '../../components/lib/components/button';
import type { RaffleSummary } from '../../types/raffles';
import { useCountdown } from './Hero';
import { isRaffleFinished } from '../../utils/raffles';
import { ACTIVATE_RAFFLE_TIME_COUNTER } from '../../config/raffleFeatures';

interface RaffleCardProps {
  raffle: RaffleSummary;
  variant?: 'single' | 'carousel';
  onDetails?: (raffle: RaffleSummary) => void;
  onVerify?: (raffle: RaffleSummary) => void;
}

export default function RaffleCard({ raffle: r, variant = 'carousel', onDetails, onVerify }: RaffleCardProps) {
  const imgW = variant === 'single' ? 'w-[92vw] sm:w-[360px] md:w-[520px]' : 'w-[300px] md:w-[360px]';
  const imgH = variant === 'single' ? 'h-[60vw] sm:h-64 md:h-80' : 'h-52 md:h-64';
  const bodyW = variant === 'single' ? 'w-[92vw] sm:w-[360px] md:w-[520px]' : 'w-[300px] md:w-[360px]';

  const soldPct = ACTIVATE_RAFFLE_TIME_COUNTER ? Math.round((r.totalSold / Math.max(1, r.ticketsTotal)) * 100) : 0;
  const available = ACTIVATE_RAFFLE_TIME_COUNTER ? Math.max(0, r.ticketsTotal - r.totalSold) : 0;
  const timeLeft = ACTIVATE_RAFFLE_TIME_COUNTER ? useCountdown(r.endsAt) : '';
  const isFinished = isRaffleFinished(r);

  return (
    <article className="bg-bg-secondary border border-border-light rounded-xl overflow-hidden shadow">
      <img src={r.coverImageUrl} alt={r.title} className={`${imgW} ${imgH} object-cover`} />
      <div className={`p-4 ${bodyW}`}>
        <h4 className="font-semibold truncate" title={r.title}>{r.title}</h4>
        <p className="text-text-secondary text-sm line-clamp-2">{r.shortDescription}</p>
        {ACTIVATE_RAFFLE_TIME_COUNTER && (
          <div className="mt-3 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-bg-tertiary/60 backdrop-blur-md border border-border-light/60 rounded-lg px-4 py-2">
              <span className="font-mono text-2xl md:text-3xl lg:text-4xl tracking-widest">{timeLeft}</span>
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-selected font-semibold">{r.price.toFixed(2)} {r.currency}</span>
          {ACTIVATE_RAFFLE_TIME_COUNTER && (
            <span className="text-text-muted text-xs">Termina {new Date(r.endsAt).toLocaleDateString()}</span>
          )}
        </div>
        {ACTIVATE_RAFFLE_TIME_COUNTER && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-selected" style={{ width: `${soldPct}%` }} />
            </div>
            <div className="text-text-muted text-xs mt-1">{available.toLocaleString()} disponibles</div>
          </div>
        )}
        <div className="mt-3">
          {isFinished ? (
            <Button 
              className="w-full" 
              onClick={() => onVerify?.(r)}
              variant="secondary"
            >
              Verificar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => onDetails?.(r)}
              >
                Comprar
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => onVerify?.(r)}
                variant="secondary"
              >
                Verificar
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


