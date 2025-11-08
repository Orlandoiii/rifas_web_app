import { Info } from 'lucide-react';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import type { RaffleVerifyTicket } from '../../types/raffles';

interface NoTicketsModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoTicketsModal({ open, onClose }: NoTicketsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Sin tickets comprados"
      lockBodyScroll
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-bg-tertiary rounded-full flex items-center justify-center">
          <Info className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-text-primary font-medium">
          Lo Sentimos, pero este documento no tiene rifas compradas para esta participación.
        </p>
        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface TicketsNoPrizesActiveModalProps {
  open: boolean;
  onClose: () => void;
  tickets: RaffleVerifyTicket[];
}

export function TicketsNoPrizesActiveModal({ open, onClose, tickets }: TicketsNoPrizesActiveModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Tus tickets comprados"
      lockBodyScroll
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          Has comprado {tickets.length} ticket{tickets.length > 1 ? 's' : ''} en esta rifa. 
          Debes esperar al resultado final para saber si alguno resultó ganador.
        </p>
        
        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Tus números de la suerte:
          </h3>
          <div className="flex flex-wrap gap-2">
            {tickets.map((ticket) => (
              <span
                key={ticket.ticketNumber}
                className="inline-flex items-center justify-center w-12 h-12 bg-binance-main/10 border border-binance-main/30 rounded-md text-sm font-bold text-binance-main"
              >
                {ticket.ticketNumber}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface TicketsNoPrizesFinishedModalProps {
  open: boolean;
  onClose: () => void;
  tickets: RaffleVerifyTicket[];
  mainWinners: number[];
  blessWinners: number[];
}

export function TicketsNoPrizesFinishedModal({ 
  open, 
  onClose, 
  tickets, 
  mainWinners, 
  blessWinners 
}: TicketsNoPrizesFinishedModalProps) {
  const allWinners = [...new Set([...mainWinners, ...blessWinners])];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Resultado de la verificación"
      lockBodyScroll
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          Lamentablemente, ninguno de tus tickets está entre los ganadores de esta rifa.
        </p>
        
        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Tus números comprados:
          </h3>
          <div className="flex flex-wrap gap-2">
            {tickets.map((ticket) => (
              <span
                key={ticket.ticketNumber}
                className="inline-flex items-center justify-center w-12 h-12 bg-bg-secondary border border-border-light rounded-md text-sm font-semibold text-text-secondary"
              >
                {ticket.ticketNumber}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-light">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Números ganadores:
          </h3>
          <div className="flex flex-wrap gap-2">
            {allWinners.map((winner) => (
              <span
                key={winner}
                className="inline-flex items-center justify-center w-12 h-12 bg-mint-main/10 border border-mint-main/30 rounded-md text-sm font-bold text-mint-main"
              >
                {winner}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

