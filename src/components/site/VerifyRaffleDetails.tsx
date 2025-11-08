import { Trophy, Calendar, DollarSign } from 'lucide-react';
import type { RaffleSummary } from '../../types/raffles';
import { useCountdown } from './Hero';
import { isRaffleFinished } from '../../utils/raffles';

interface VerifyRaffleDetailsProps {
  raffle: RaffleSummary;
}

export default function VerifyRaffleDetails({ raffle }: VerifyRaffleDetailsProps) {
  const timeLeft = useCountdown(raffle.endsAt);
  const isFinished = isRaffleFinished(raffle);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const soldPct = Math.round((raffle.totalSold / Math.max(1, raffle.ticketsTotal)) * 100);
  const available = Math.max(0, raffle.ticketsTotal - raffle.totalSold);

  return (
    <div className="bg-bg-secondary rounded-2xl overflow-hidden border border-border-light shadow-lg">
      {/* Imagen de portada */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        <img
          src={raffle.coverImageUrl}
          alt={raffle.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-bold mb-2">
            {raffle.title}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {raffle.shortDescription}
          </p>
        </div>
      </div>

      {/* Información de la rifa */}
      <div className="p-6 space-y-6">
        {/* Stats principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-mint-main" />
              <span className="text-xs text-text-muted">Precio</span>
            </div>
            <p className="text-lg font-bold text-text-primary">
              {formatCurrency(raffle.price, raffle.currency)}
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-binance-main" />
              <span className="text-xs text-text-muted">Vendidos</span>
            </div>
            <p className="text-lg font-bold text-text-primary">
              {raffle.totalSold.toLocaleString()}
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-text-muted">Disponibles</span>
            </div>
            <p className="text-lg font-bold text-mint-main">
              {available.toLocaleString()}
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-text-muted" />
              <span className="text-xs text-text-muted">Estado</span>
            </div>
            <p className={`text-lg font-bold ${isFinished ? 'text-state-success' : 'text-state-warning'}`}>
              {isFinished ? 'Finalizada' : 'Activa'}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">Progreso de ventas</span>
            <span className="text-sm text-text-secondary">{soldPct}%</span>
          </div>
          <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mint-main to-mint-dark transition-all duration-500"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>

        {/* Información de tiempo */}
        {!isFinished && (
          <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Tiempo restante:</span>
              <span className="text-lg font-bold text-text-primary font-mono">{timeLeft}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

