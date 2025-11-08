import { useState, useEffect, useRef } from 'react';
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
  initialDocumentId?: string;
  onClose?: () => void;
}

export default function VerifyRaffleForm({ raffle, initialDocumentId, onClose }: VerifyRaffleFormProps) {
  const [documentId, setDocumentId] = useState(initialDocumentId || '');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  
  const { verify, getPrizeForTicket, reset, isVerifying, error, result } = useVerifyRaffle();
  const hasAutoVerified = useRef(false);

  // Ejecutar verificación automáticamente si viene initialDocumentId
  useEffect(() => {
    if (initialDocumentId && initialDocumentId.trim() && raffle && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      verify(raffle, initialDocumentId);
    }
  }, [initialDocumentId, raffle, verify]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId.trim()) {
      return;
    }

    await verify(raffle, documentId);
  };

  const handleTicketClick = async (ticket: { ticketNumber: number; isMainPrize?: boolean; isBlessNumber?: boolean }) => {
    console.log('Click en ticket:', ticket);
    console.log('Es MainPrize:', ticket.isMainPrize);
    console.log('Es BlessNumber:', ticket.isBlessNumber);
    
    if (!documentId.trim()) {
      console.warn('No hay documentId disponible para buscar el premio');
      return;
    }
    
    const prize = await getPrizeForTicket(raffle, ticket, documentId.trim());
    
    if (prize) {
      console.log('Premio obtenido exitosamente:', prize);
      setSelectedPrize(prize);
    } else {
      console.warn('No se pudo obtener el premio para el ticket:', ticket.ticketNumber);
    }
  };

  const handleClosePrizeModal = () => {
    setSelectedPrize(null);
  };

  const handleCloseResultModal = () => {
    reset();
    setDocumentId(initialDocumentId || '');
    hasAutoVerified.current = false; // Permitir nueva verificación automática si hay initialDocumentId
  };

  // Mostrar resultados si hay tickets con premios
  const showResults = result.type === 'tickets-with-prizes';

  return (
    <>
      <div className="bg-bg-secondary rounded-2xl p-4 sm:p-6 md:p-8 border border-border-light shadow-lg w-full max-w-full overflow-x-hidden">
        {!showResults && (
          <>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-2 wrap-break-word">
                Verifica tus boletos
              </h2>
              <p className="text-sm sm:text-base text-text-secondary wrap-break-word">
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
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => reset()}
                        className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        aria-label="Cerrar error"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
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
          <div className="space-y-4 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary wrap-break-word flex-1">
                Resultado de Verificación
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {onClose && (
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cerrar
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleCloseResultModal}
                  className="w-full sm:w-auto"
                >
                  Nueva verificación
                </Button>
              </div>
            </div>
            <VerifyResultWithPrizes
              allTickets={result.tickets}
              winningTickets={result.winningTickets}
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

