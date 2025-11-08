import { motion } from 'framer-motion';
import { Calendar, Hash, Ticket, ChevronRight } from 'lucide-react';
import type { PurchaseSuccessData } from './PurchaseSuccessView';

interface PurchaseCardProps {
  purchase: PurchaseSuccessData;
  onClick: () => void;
}

export default function PurchaseCard({ purchase, onClick }: PurchaseCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (transactionId: string) => {
    // Intentar extraer fecha del transactionId o usar fecha actual
    // Por ahora, usamos la fecha actual como placeholder
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-bg-secondary border border-border-light rounded-xl p-4 sm:p-5 cursor-pointer hover:border-mint-main transition-all duration-300 hover:shadow-lg"
    >
      {/* Header con imagen y título */}
      <div className="flex gap-3 sm:gap-4 mb-4">
        <div className="shrink-0">
          <img
            src={purchase.raffle.coverImageUrl}
            alt={purchase.raffle.title}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 truncate">
            {purchase.raffle.title}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
            {purchase.raffle.shortDescription}
          </p>
        </div>
        <ChevronRight className="shrink-0 w-5 h-5 text-text-muted self-center" />
      </div>

      {/* Información de la compra */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Fecha</p>
            <p className="text-sm font-semibold text-text-primary truncate">
              {formatDate(purchase.transactionId)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-text-muted shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Tickets</p>
            <p className="text-sm font-semibold text-text-primary">
              {purchase.tickets.length} {purchase.tickets.length === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
        </div>
      </div>

      {/* Números comprados */}
      <div className="mb-4">
        <p className="text-xs text-text-muted mb-2">Números de la suerte</p>
        <div className="flex flex-wrap gap-1.5">
          {purchase.tickets.slice(0, 8).map((ticket) => (
            <span
              key={ticket}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-binance-main/10 border border-binance-main/30 rounded-md text-xs sm:text-sm font-bold text-binance-main"
            >
              {ticket}
            </span>
          ))}
          {purchase.tickets.length > 8 && (
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-bg-tertiary border border-border-light rounded-md text-xs sm:text-sm font-semibold text-text-secondary">
              +{purchase.tickets.length - 8}
            </span>
          )}
        </div>
      </div>

      {/* Footer con monto y referencia */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-4 h-4 text-text-muted shrink-0" />
          <span className="text-xs font-mono text-text-muted truncate">
            {purchase.refIbp}
          </span>
        </div>
        <div className="shrink-0 ml-2">
          <span className="text-base sm:text-lg font-bold text-mint-main">
            {formatCurrency(purchase.amount, purchase.currency)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

