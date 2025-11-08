import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '../lib/components/button';
import { Input } from '../lib/components/input';
import { rafflesService } from '../../services/raffles';
import type { RaffleSummary } from '../../types/raffles';

interface VerifyRaffleFormProps {
  raffle: RaffleSummary;
}

export default function VerifyRaffleForm({ raffle }: VerifyRaffleFormProps) {
  const [documentId, setDocumentId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId.trim()) {
      setError('Por favor, ingresa tu número de cédula');
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const result = await rafflesService.verifyRaffle({
        raffleId: raffle.id,
        documentId: documentId.trim(),
      });
      
      // Imprimir resultado en consola
      console.log('Resultado de verificación:', result);
      console.log('Rifa ID:', result.raffleId);
      console.log('Documento:', result.documentId);
      console.log('Tickets comprados:', result.boughtTickets);
      
      // TODO: Mostrar resultado en la UI
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Error al verificar:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-light shadow-lg">
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
                  onClick={() => setError(null)}
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
              setError(null);
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
    </div>
  );
}

