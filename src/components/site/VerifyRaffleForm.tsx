import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '../lib/components/button';
import { Input } from '../lib/components/input';
import { useVerifyRaffle } from '../../hooks/useVerifyRaffle';
import VerifyResultWithPrizes from './VerifyResultWithPrizes';
import { NoTicketsModal, TicketsNoPrizesActiveModal, TicketsNoPrizesFinishedModal } from './VerifyResultModals';
import PrizeWinnerModal from './PrizeWinnerModal';
import type { RaffleSummary } from '../../types/raffles';
import type { Prize } from '../../types/prizes';

interface VerifyRaffleFormProps {
  raffle: RaffleSummary;
}

export default function VerifyRaffleForm({ raffle }: VerifyRaffleFormProps) {
  const [documentId, setDocumentId] = useState('');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [viewedPrizes, setViewedPrizes] = useState<Set<number>>(new Set());
  
  const { verify, getPrizeForTicket, reset, isVerifying, error, result } = useVerifyRaffle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId.trim()) {
      return;
    }

    setViewedPrizes(new Set()); // Reset viewed prizes
    await verify(raffle, documentId);
  };

  const handleTicketClick = async (ticket: { ticketNumber: number; isMainPrize?: boolean; isBlessNumber?: boolean }) => {
    console.log('Click en ticket:', ticket);
    console.log('Es MainPrize:', ticket.isMainPrize);
    console.log('Es BlessNumber:', ticket.isBlessNumber);
    
    const prize = await getPrizeForTicket(raffle, ticket);
    
    if (prize) {
      console.log('Premio obtenido exitosamente:', prize);
      setSelectedPrize(prize);
      // Marcar el ticket como visto
      setViewedPrizes(prev => new Set(prev).add(ticket.ticketNumber));
    } else {
      console.warn('No se pudo obtener el premio para el ticket:', ticket.ticketNumber);
    }
  };

  const handleClosePrizeModal = () => {
    setSelectedPrize(null);
  };

  const handleCloseResultModal = () => {
    reset();
    setDocumentId('');
    setViewedPrizes(new Set());
  };

  // Mostrar resultados si hay tickets con premios
  const showResults = result.type === 'tickets-with-prizes';

  return (
    <>
      <div className="bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-light shadow-lg">
        {!showResults && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                Verifica tus boletos
              </h2>
              <p className="text-text-secondary">
                Ingresa tu número de cédula para verificar si tienes números ganadores en esta rifa
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert Dropdown */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-state-error/10 border border-state-error rounded-lg p-3 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-state-error shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-state-error">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => reset()}
                        className="shrink-0 p-1 hover:bg-state-error/20 rounded transition-colors"
                        aria-label="Cerrar error"
                      >
                        <X className="w-4 h-4 text-state-error" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="documentId" className="block text-sm font-semibold text-text-primary mb-2">
                  Documento de identificación
                </label>
                <Input
                  id="documentId"
                  type="text"
                  value={documentId}
                  onChange={(e) => {
                    setDocumentId(e.target.value);
                    reset();
                  }}
                  placeholder="Ingrese la cédula de identidad"
                  disabled={isVerifying}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || !documentId.trim()}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verificar mis números
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border-light">
              <p className="text-xs text-text-muted text-center">
                Al verificar, podrás ver todos los números que compraste y si alguno resultó ganador
              </p>
            </div>
          </>
        )}

        {/* Mostrar resultados con premios */}
        {showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Resultado de Verificación
              </h2>
              <Button
                variant="secondary"
                onClick={handleCloseResultModal}
              >
                Nueva verificación
              </Button>
            </div>
            <VerifyResultWithPrizes
              allTickets={result.tickets}
              winningTickets={result.winningTickets.filter(t => !viewedPrizes.has(t.ticketNumber))}
              onTicketClick={handleTicketClick}
            />
          </div>
        )}
      </div>

      {/* Modales de resultados */}
      <NoTicketsModal
        open={result.type === 'no-tickets'}
        onClose={handleCloseResultModal}
      />

      <TicketsNoPrizesActiveModal
        open={result.type === 'tickets-no-prizes-active'}
        onClose={handleCloseResultModal}
        tickets={result.type === 'tickets-no-prizes-active' ? result.tickets : []}
      />

      <TicketsNoPrizesFinishedModal
        open={result.type === 'tickets-no-prizes-finished'}
        onClose={handleCloseResultModal}
        tickets={result.type === 'tickets-no-prizes-finished' ? result.tickets : []}
        mainWinners={result.type === 'tickets-no-prizes-finished' ? result.mainWinners : []}
        blessWinners={result.type === 'tickets-no-prizes-finished' ? result.blessWinners : []}
      />

      {/* Modal de premio */}
      <PrizeWinnerModal
        prize={selectedPrize}
        open={!!selectedPrize}
        onClose={handleClosePrizeModal}
      />
    </>
  );
}

