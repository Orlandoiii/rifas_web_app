import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import type { RaffleSummary } from '../../types/raffles';

export interface PurchaseSuccessData {
  // IDs de transacción
  transactionId: string;
  refIbp: string;
  bookingId: string;
  
  // Datos de la rifa
  raffle: RaffleSummary;
  
  // Datos del comprador
  buyer: {
    name: string;
    email: string;
    phone: string;
    id: string;
  };
  
  // Tickets comprados
  tickets: number[];
  
  // Monto pagado
  amount: number;
  currency: string;
}

interface PurchaseSuccessViewProps {
  data: PurchaseSuccessData | null;
  open: boolean;
  onClose: () => void;
}

interface CopyButtonProps {
  value: string;
  label: string;
}

function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100 truncate">
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        title={copied ? 'Copiado' : 'Copiar'}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
}

export default function PurchaseSuccessView({ data, open, onClose }: PurchaseSuccessViewProps) {
  if (!data) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      size="xl" 
      title="¡Compra Exitosa!"
      lockBodyScroll
      closeOnBackdropClick={false}
    >
      {/* Header con ícono de éxito y fecha */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
        >
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </motion.div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate()}
        </p>
      </div>

      {/* Contenido del ticket */}
      <div className="space-y-6">
        {/* Información de la rifa */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Detalles de la Rifa
          </h3>
          <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
              {data.raffle.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.raffle.shortDescription}
            </p>
          </div>
        </div>

        {/* Datos del comprador */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Datos del Participante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {data.buyer.name}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cédula</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {data.buyer.id}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {data.buyer.email}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {data.buyer.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Tickets comprados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Tus Números de la Suerte
          </h3>
          <div className="bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800">
            <div className="flex flex-wrap gap-2 justify-center">
              {data.tickets.map((ticket, index) => (
                <motion.div
                  key={ticket}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <span className="text-2xl font-bold text-white">
                    {ticket}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total de tickets:
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {data.tickets.length}
              </span>
            </div>
          </div>
        </div>

        {/* Monto pagado */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto Total Pagado:
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(data.amount, data.currency)}
            </span>
          </div>
        </div>

        {/* Referencias de transacción */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Referencias de Transacción
          </h3>
          <div className="space-y-3">
            <CopyButton
              label="ID de Transacción"
              value={data.transactionId}
            />
            <CopyButton
              label="Referencia IBP"
              value={data.refIbp}
            />
            <CopyButton
              label="Número de Reserva"
              value={data.bookingId}
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <strong>¡Importante!</strong> Guarda estas referencias para cualquier consulta futura.
            Hemos enviado una copia de esta información a tu correo electrónico.
          </p>
        </div>

        {/* Botón de cerrar */}
        <Button
          onClick={onClose}
          className="w-full"
        >
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
