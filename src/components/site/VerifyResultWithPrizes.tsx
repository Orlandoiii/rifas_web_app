import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  // Incluir todos los tickets bendecidos, incluso los que también son premio principal
  const blessTickets = winningTickets.filter(t => t.isBlessNumber);
  const regularTickets = allTickets.filter(
    t => !t.isMainPrize && !t.isBlessNumber
  );

  const hasWinningTickets = winningTickets.length > 0;
  
  // Crear una key única basada en los tickets para forzar remount cuando cambian
  const ticketsKey = useMemo(() => 
    allTickets.map(t => t.ticketNumber).join(',') + '-' + 
    winningTickets.map(t => t.ticketNumber).join(','),
    [allTickets, winningTickets]
  );

  // Efecto de confetti cuando hay tickets ganadores
  useEffect(() => {
    if (hasWinningTickets) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confeti dorado desde la izquierda
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#F0B90B', '#FFD700', '#FFA500', '#FF8C00']
        });

        // Confeti dorado desde la derecha
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#F0B90B', '#FFD700', '#FFA500', '#FF8C00']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [hasWinningTickets]);

  return (
    <div key={ticketsKey} className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header de felicitación cuando hay ganadores */}
      {hasWinningTickets && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-linear-to-br from-binance-light via-binance-main to-binance-dark rounded-xl p-4 sm:p-6 border-2 border-binance-main shadow-lg w-full max-w-full overflow-x-hidden"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-base sm:text-lg tracking-wider">
                ¡FELICIDADES! ERES GANADOR
              </span>
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
            >
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-white" strokeWidth={1.5} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white text-sm sm:text-base font-semibold"
            >
              ¡Tienes {winningTickets.length} número{winningTickets.length > 1 ? 's' : ''} ganador{winningTickets.length > 1 ? 'es' : ''}!
            </motion.p>
          </div>
        </motion.div>
      )}

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-linear-to-br from-binance-main/10 via-binance-main/5 to-transparent rounded-xl p-3 sm:p-4 md:p-6 border-2 border-binance-main shadow-lg w-full max-w-full overflow-x-hidden"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mb-3 sm:mb-4"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-binance-main shrink-0" />
          </motion.div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-binance-main wrap-break-word">
            ¡Tickets Ganadores!
          </h3>
        </motion.div>

        {/* Main Prize - Destacado */}
        {mainPrizeTickets.length > 0 && (
          <div
            key={`main-section-${ticketsKey}`}
            style={{ 
              // Asegurar que siempre sea visible
              visibility: 'visible',
              opacity: 1
            }}
            className="mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-binance-main shrink-0" />
              </motion.div>
              <span className="text-xs sm:text-sm md:text-base font-bold text-binance-main wrap-break-word">
                PREMIO PRINCIPAL
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {mainPrizeTickets.map((ticket, index) => {
                const isAlsoBless = ticket.isBlessNumber && ticket.isMainPrize;
                return (
                  <motion.button
                    key={`main-${ticket.ticketNumber}-${ticketsKey}`}
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTicketClick(ticket)}
                    style={{ 
                      // Asegurar que siempre sea visible, incluso si la animación falla
                      minWidth: '3rem',
                      minHeight: '3rem',
                      opacity: 1, // Forzar opacidad completa siempre
                      visibility: 'visible'
                    }}
                    className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer shrink-0 relative overflow-hidden ${
                      isAlsoBless 
                        ? 'bg-linear-to-br from-mint-main via-binance-main to-binance-dark border-2 border-mint-main' 
                        : 'bg-linear-to-br from-binance-main to-binance-dark border-2 border-binance-main'
                    }`}
                  >
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-white/20 rounded-lg"
                    />
                    <span className="relative z-10">{ticket.ticketNumber}</span>
                    {/* Badge indicando que también es bendecido */}
                    {isAlsoBless && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1, type: 'spring' }}
                        className="absolute -top-1 -right-1 bg-mint-main border-2 border-white rounded-full p-0.5 sm:p-1 shadow-lg"
                        title="También es premio bendecido"
                      >
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {/* Mensaje informativo si hay tickets que son ambos */}
            {mainPrizeTickets.some(t => t.isBlessNumber && t.isMainPrize) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-xs sm:text-sm text-mint-main mt-2 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Algunos números también son premios bendecidos</span>
              </motion.p>
            )}
          </div>
        )}

        {/* Bless Numbers */}
        {blessTickets.length > 0 && (
          <div
            key={`bless-section-${ticketsKey}`}
            style={{ 
              // Asegurar que siempre sea visible
              visibility: 'visible',
              opacity: 1
            }}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-mint-main shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-bold text-mint-main wrap-break-word">
                Premios Benditos
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {blessTickets.map((ticket, index) => (
                <motion.button
                  key={`bless-${ticket.ticketNumber}-${ticketsKey}`}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTicketClick(ticket)}
                  style={{ 
                    // Asegurar que siempre sea visible, incluso si la animación falla
                    minWidth: '2.75rem',
                    minHeight: '2.75rem',
                    opacity: 1, // Forzar opacidad completa siempre
                    visibility: 'visible'
                  }}
                  className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-mint-main/20 border-2 border-mint-main rounded-lg text-xs sm:text-sm md:text-base lg:text-lg font-bold text-mint-main hover:bg-mint-main/30 transition-all cursor-pointer shrink-0 shadow-md hover:shadow-lg"
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
      </motion.div>
    </div>
  );
}

