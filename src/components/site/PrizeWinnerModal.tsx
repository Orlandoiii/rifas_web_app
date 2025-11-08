import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import type { Prize } from '../../types/prizes';

interface PrizeWinnerModalProps {
  prize: Prize | null;
  open: boolean;
  onClose: () => void;
}

export default function PrizeWinnerModal({ prize, open, onClose }: PrizeWinnerModalProps) {
  useEffect(() => {
    if (open && prize) {
      // Lanzar confeti cuando se abre el modal
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
  }, [open, prize]);

  if (!prize) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title=""
      lockBodyScroll
      closeOnBackdropClick={false}
    >
      <div className="relative overflow-hidden">
        {/* Fondo con patrón */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 40px
            )`
          }} />
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center py-8">
          {/* Badge WINNER */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-binance-main rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg tracking-wider">GANADOR</span>
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>

          {/* Trofeo animado */}
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              {/* Brillo detrás del trofeo */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-binance-main rounded-full blur-3xl"
              />
              
              {/* Trofeo */}
              <div className="relative bg-linear-to-br from-binance-light via-binance-main to-binance-dark p-8 rounded-full">
                <Trophy className="w-24 h-24 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Mensaje de felicitación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              ¡Felicidades!
            </h2>
            <p className="text-text-secondary mb-6">
              Tu número ha sido seleccionado como ganador
            </p>
          </motion.div>

          {/* Información del premio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light"
          >
            {/* Imagen del premio */}
            <div className="mb-4">
              <img
                src={prize.imageUrl}
                alt={prize.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Título y descripción */}
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {prize.title}
            </h3>
            <p className="text-text-secondary mb-4">
              {prize.shortDescription}
            </p>

            {/* Número ganador */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-binance-main/10 border-2 border-binance-main rounded-lg">
              <span className="text-text-secondary text-sm font-medium">
                Número ganador:
              </span>
              <span className="text-binance-main text-2xl font-bold">
                {prize.winningTicket}
              </span>
            </div>
          </motion.div>

          {/* Mensaje informativo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-mint-main/10 border border-mint-main rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-text-primary">
              <strong className="text-mint-main">¡Importante!</strong> Nos pondremos en contacto contigo 
              para coordinar la entrega de tu premio.
            </p>
          </motion.div>

          {/* Botón de cerrar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={onClose}
              className="w-full"
            >
              ¡Entendido!
            </Button>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}

