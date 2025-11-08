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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Resumen de tickets comprados */}
      <div className="bg-bg-secondary rounded-xl p-3 sm:p-4 md:p-6 border border-border-light w-full max-w-full overflow-x-hidden">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4 wrap-break-word">
          Tus tickets comprados
        </h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {allTickets.map((ticket) => (
            <span
              key={ticket.ticketNumber}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-bg-tertiary border border-border-light rounded-md text-xs sm:text-sm md:text-base font-semibold text-text-secondary shrink-0"
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
      <div className="bg-bg-secondary rounded-xl p-3 sm:p-4 md:p-6 border border-border-light w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-binance-main shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-text-primary wrap-break-word">
            ¡Tickets Ganadores!
          </h3>
        </div>

        {/* Main Prize - Destacado */}
        {mainPrizeTickets.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-binance-main shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-binance-main wrap-break-word">
                PREMIO PRINCIPAL
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {mainPrizeTickets.map((ticket) => (
                <motion.button
                  key={ticket.ticketNumber}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTicketClick(ticket)}
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-linear-to-br from-binance-main to-binance-dark border-2 border-binance-main rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
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
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-text-primary wrap-break-word">
                Premios Bless
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {blessTickets.map((ticket) => (
                <motion.button
                  key={ticket.ticketNumber}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTicketClick(ticket)}
                  className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-mint-main/20 border-2 border-mint-main rounded-lg text-xs sm:text-sm md:text-base lg:text-lg font-bold text-mint-main hover:bg-mint-main/30 transition-all cursor-pointer shrink-0"
                >
                  {ticket.ticketNumber}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Tickets regulares (sin premio) */}
        {regularTickets.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-light">
            <p className="text-xs sm:text-sm text-text-muted mb-2 sm:mb-3 wrap-break-word">
              Tickets sin premio:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {regularTickets.map((ticket) => (
                <span
                  key={ticket.ticketNumber}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-bg-tertiary border border-border-light rounded-md text-xs sm:text-sm font-semibold text-text-secondary shrink-0"
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

