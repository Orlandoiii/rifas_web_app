import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import type { RaffleVerifyTicket } from '../../types/raffles';

interface VerifyResultWithPrizesProps {
  allTickets: RaffleVerifyTicket[];
  winningTickets: RaffleVerifyTicket[];
  onTicketClick: (ticket: RaffleVerifyTicket) => void;
}

export default function VerifyResultWithPrizes({ 
  allTickets, 
  winningTickets, 
  onTicketClick 
}: VerifyResultWithPrizesProps) {
  // Separar main prize de bless numbers
  // Los tickets que son mainPrize se muestran primero (incluso si también son bless)
  const mainPrizeTickets = winningTickets.filter(t => t.isMainPrize);
  const blessTickets = winningTickets.filter(t => t.isBlessNumber && !t.isMainPrize);
  const regularTickets = allTickets.filter(
    t => !t.isMainPrize && !t.isBlessNumber
  );

  return (
    <div className="space-y-6">
      {/* Resumen de tickets comprados */}
      <div className="bg-bg-secondary rounded-xl p-4 sm:p-6 border border-border-light">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Tus tickets comprados
        </h3>
        <div className="flex flex-wrap gap-2">
          {allTickets.map((ticket) => (
            <span
              key={ticket.ticketNumber}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-bg-tertiary border border-border-light rounded-md text-sm sm:text-base font-semibold text-text-secondary"
            >
              {ticket.ticketNumber}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-muted mt-3">
          Total: {allTickets.length} ticket{allTickets.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Tickets premiados */}
      <div className="bg-bg-secondary rounded-xl p-4 sm:p-6 border border-border-light">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-binance-main" />
          <h3 className="text-lg font-semibold text-text-primary">
            ¡Tickets Ganadores!
          </h3>
        </div>

        {/* Main Prize - Destacado */}
        {mainPrizeTickets.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-binance-main" />
              <span className="text-sm font-bold text-binance-main">
                PREMIO PRINCIPAL
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mainPrizeTickets.map((ticket) => (
                <motion.button
                  key={ticket.ticketNumber}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTicketClick(ticket)}
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-binance-main to-binance-dark border-2 border-binance-main rounded-lg text-lg sm:text-xl font-bold text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {ticket.ticketNumber}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Bless Numbers */}
        {blessTickets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-text-primary">
                Premios Bless
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {blessTickets.map((ticket) => (
                <motion.button
                  key={ticket.ticketNumber}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTicketClick(ticket)}
                  className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-mint-main/20 border-2 border-mint-main rounded-lg text-base sm:text-lg font-bold text-mint-main hover:bg-mint-main/30 transition-all cursor-pointer"
                >
                  {ticket.ticketNumber}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Tickets regulares (sin premio) */}
        {regularTickets.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-sm text-text-muted mb-3">
              Tickets sin premio:
            </p>
            <div className="flex flex-wrap gap-2">
              {regularTickets.map((ticket) => (
                <span
                  key={ticket.ticketNumber}
                  className="inline-flex items-center justify-center w-12 h-12 bg-bg-tertiary border border-border-light rounded-md text-sm font-semibold text-text-secondary"
                >
                  {ticket.ticketNumber}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

