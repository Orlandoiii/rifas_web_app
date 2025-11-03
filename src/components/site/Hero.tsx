import { useEffect, useState } from 'react';
import { Button } from '../../components/lib/components/button';
import { Loader } from '../../components/lib/components/loader';
import { useTheme } from '../../components/lib/components/theme';
import type { RaffleSummary } from '../../types/raffles';


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

function BuyButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="w-full md:w-auto lg:text-base lg:h-12 lg:px-8">Comprar ahora</Button>
  );
}

function RaffleDetails({ raffle, timeLeft, onBuy }: { raffle: RaffleSummary; timeLeft: string; onBuy: () => void }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold drop-shadow">{raffle.title}</h2>
      <p className="text-text-secondary font-semibold text-sm md:text-base lg:text-lg mt-2 max-w-2xl mx-auto drop-shadow">
        {raffle.shortDescription}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
        <Chip className="text-selected font-semibold text-base md:text-lg bg-bg-secondary/70 backdrop-blur-md">{raffle.price.toFixed(2)} {raffle.currency} / ticket</Chip>
        <Chip className="text-text-primary text-sm md:text-base bg-bg-secondary/70 backdrop-blur-md">Finaliza en: <span className="font-semibold text-selected">{timeLeft}</span></Chip>
      </div>
      <div className="mt-6">
        <BuyButton onClick={onBuy} />
      </div>
    </div>
  );
}

interface HeroProps {
  raffle: RaffleSummary | null;
  onBuy: () => void;
}

export default function Hero({ raffle, onBuy }: HeroProps) {
  const { theme } = useTheme();
  const timeLeft = useCountdown(raffle?.endsAt);
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
          {raffle ? (
            <RaffleDetails raffle={raffle} timeLeft={timeLeft} onBuy={onBuy} />
          ) : (
            <div className="bg-bg-secondary/80 border border-border-light rounded-2xl p-5 max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                <Loader size="sm" />
                <div>
                  <p className="text-text-primary font-medium">Cargando rifa vigente...</p>
                  <p className="text-text-secondary text-sm">Explora nuestras rifas disponibles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


