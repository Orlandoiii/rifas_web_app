import { useEffect, useState } from 'react';
import { Button } from '../../components/lib/components/button';
import { Loader } from '../../components/lib/components/loader';
import { useTheme } from '../../components/lib/components/theme';
import type { RaffleSummary } from '../../types/raffles';
import { isRaffleFinished } from '../../utils/raffles';
import { ACTIVATE_RAFFLE_TIME_COUNTER } from '../../config/raffleFeatures';
import { useCoins } from '../lib/context';


function useResolvedTheme(theme: 'dark' | 'light' | 'system') {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return theme;
}

export function useCountdown(targetIso?: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const format = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft('Finalizada');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${days}d ${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return timeLeft;
}

function HeroHeader() {
  return (
    <div className="max-w-3xl mx-auto text-center md:-translate-y-6 lg:-translate-y-10">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
        Bienvenido a las mejores rifas
      </h1>
      <p className="mt-4 text-text-secondary font-semibold md:text-lg lg:text-xl">
        Participa de forma rápida y segura. ¡Grandes premios te esperan!
      </p>
    </div>
  );
}

function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-4 py-1.5 ${className}`}>{children}</span>
  );
}

function RaffleDetails({ raffle, timeLeft, onBuy, onVerify }: { raffle: RaffleSummary; timeLeft: string; onBuy: () => void; onVerify: () => void }) {
  const isFinished = isRaffleFinished(raffle);
  const { getCoinDisplayName } = useCoins();


  const coinDisplayName = getCoinDisplayName(raffle.currency);

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold drop-shadow">{raffle.title}</h2>
      <p className="text-text-secondary font-semibold text-sm md:text-base lg:text-lg mt-2 max-w-2xl mx-auto drop-shadow">
        {raffle.shortDescription}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
        <Chip className="text-selected font-semibold text-base md:text-lg bg-bg-secondary/70 backdrop-blur-md">{raffle.price.toFixed(2)} {coinDisplayName} / ticket</Chip>
        {ACTIVATE_RAFFLE_TIME_COUNTER && (
          <Chip className="text-text-primary text-sm md:text-base bg-bg-secondary/70 backdrop-blur-md">Finaliza en: <span className="font-semibold text-selected">{timeLeft}</span></Chip>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3">
        {isFinished ? (
          <Button 
            onClick={onVerify} 
            className="w-full md:w-auto lg:text-base lg:h-12 lg:px-8"
            variant="secondary"
          >
            Verificar
          </Button>
        ) : (
          <>
            <Button 
              onClick={onBuy} 
              className="w-full md:w-auto lg:text-base lg:h-12 lg:px-8"
            >
              Comprar ahora
            </Button>
            <Button 
              onClick={onVerify} 
              className="w-full md:w-auto lg:text-base lg:h-12 lg:px-8"
              variant="secondary"
            >
              Verificar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface HeroProps {
  raffle: RaffleSummary | null;
  isLoading?: boolean;
  isError?: boolean;
  onBuy: () => void;
  onVerify: () => void;
}

export default function Hero({ raffle, isLoading = false, isError = false, onBuy, onVerify }: HeroProps) {
  const { theme } = useTheme();
  const timeLeft = ACTIVATE_RAFFLE_TIME_COUNTER ? useCountdown(raffle?.endsAt) : '';
  const resolvedTheme = useResolvedTheme(theme);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-center bg-cover"
          style={{ backgroundImage: `url('/hero.jpg')` }}
        />
        <div className={`absolute inset-0 ${resolvedTheme === 'light' ? 'bg-linear-to-b from-bg-primary/50 to-bg-primary/60' : 'bg-linear-to-b from-bg-primary/70 to-bg-primary/80'}`} />
      </div>

      <div className="relative mx-auto max-w-7xl w-full px-4 py-12 md:py-16">
        <HeroHeader />

        <div className="mt-8 md:mt-10 lg:mt-12 mx-auto max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader size="md" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 bg-bg-secondary/80 border border-border-light rounded-2xl p-5 max-w-xl mx-auto">
              <p className="text-text-secondary text-sm">Error al cargar las rifas.</p>
              <p className="text-text-muted text-xs mt-1">Por favor, intenta recargar la página.</p>
            </div>
          ) : raffle ? (
            <RaffleDetails raffle={raffle} timeLeft={timeLeft} onBuy={onBuy} onVerify={onVerify} />
          ) : (
            <div className="text-center py-8 bg-bg-secondary/80 border border-border-light rounded-2xl p-5 max-w-xl mx-auto">
              <p className="text-text-secondary text-sm">No hay rifas disponibles en este momento.</p>
              <p className="text-text-muted text-xs mt-1">Vuelve pronto para ver nuevas rifas.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


