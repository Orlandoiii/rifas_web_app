import * as React from 'react';
import { Button } from '../../lib/components/button';
import { extractErrorMessage } from '../../../utils/errorMessages';
import { useSypagoRejectCodes } from '../../../hooks/usePayments';

interface OTPVerificationProps {
  raffleTitle: string;
  selectedNumbers: number[];
  price: number;
  currency: string;
  onVerify: (otp: string, onStatusUpdate?: (status: string) => void) => Promise<void>;
  disabled?: boolean;
  countdown?: number;
  onResend?: () => Promise<void>;
}

export default function OTPVerification({
  raffleTitle,
  selectedNumbers,
  price,
  currency,
  onVerify,
  disabled = false,
  countdown = 0,
  onResend
}: OTPVerificationProps) {
  const [otp, setOtp] = React.useState<string[]>(Array(8).fill(''));
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [processingStatus, setProcessingStatus] = React.useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const { data: rejectCodes = [] } = useSypagoRejectCodes();

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);

  // Función para obtener la descripción de un código de rechazo
  const getRejectCodeDescription = React.useCallback((rejectCode: string): string | null => {
    if (!rejectCode || !rejectCodes.length) return null;
    const code = rejectCodes.find(rc => rc.code === rejectCode);
    return code ? code.description : null;
  }, [rejectCodes]);

  // Función para formatear el mensaje de error con código de rechazo
  const formatRejectionError = React.useCallback((errorMessage: string): string => {
    if (!rejectCodes.length) return errorMessage;
    
    // Buscar código de rechazo en el mensaje (diferentes formatos posibles)
    const codeMatch = errorMessage.match(/[Cc]ódigo:\s*([A-Z0-9]{2,6})/i) || 
                     errorMessage.match(/[Cc]ode:\s*([A-Z0-9]{2,6})/i) ||
                     errorMessage.match(/\b([A-Z]{2,4}\d{2,4})\b/);
    
    if (codeMatch && codeMatch[1]) {
      const rejectCode = codeMatch[1].toUpperCase();
      const description = getRejectCodeDescription(rejectCode);
      
      if (description) {
        // Reemplazar el mensaje original con la descripción del código
        return `El pago fue rechazado. ${description}`;
      }
    }
    
    return errorMessage;
  }, [getRejectCodeDescription, rejectCodes]);

  // Auto-focus en el primer input cuando se monta el componente
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus al siguiente input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    const digits = pastedData.split('').filter(char => /^\d$/.test(char));
    
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 8) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus en el siguiente input vacío o el último
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 7 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleConfirm = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 8) {
      setIsVerifying(true);
      setError('');
      setProcessingStatus('PROCESSING');
      try {
        await onVerify(otpValue, (status) => {
          setProcessingStatus(status);
        });
      } catch (err) {
        let message = extractErrorMessage(
          err,
          'Error al verificar el código OTP. Por favor, verifique el código e intente nuevamente.'
        );
        
        // Si el mensaje parece ser un rechazo (RJCT), intentar formatear con código de rechazo
        if (message.includes('rechazado') || message.includes('rejected') || message.includes('RJCT')) {
          message = formatRejectionError(message);
        }
        
        setError(message);
        setProcessingStatus(null);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setIsResending(true);
    setError('');
    try {
      await onResend();
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'Error al reenviar el código OTP. Por favor, intente nuevamente.'
      );
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');
  const canResend = countdown === 0 && onResend;
  const isDisabled = disabled || isVerifying || isResending;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="bg-bg-tertiary/40 border border-border-light rounded-lg p-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-text-primary font-semibold truncate">{raffleTitle}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-text-secondary">Tickets: <span className="text-text-primary font-semibold">{selectedNumbers.length}</span></span>
            <span className="text-text-secondary">Total: <span className="text-selected font-semibold">{total.toFixed(2)} {currency}</span></span>
          </div>
        </div>
        {!!selectedNumbers.length && (
          <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-auto">
            {selectedNumbers.slice().sort((a, b) => a - b).map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded-md bg-bg-secondary border border-border-light text-text-primary">#{n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Icono y mensaje */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-selected/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-selected" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Ingrese la clave de pago
          </h3>
          <p className="text-sm text-text-secondary">
            enviada a su cuenta de correo electrónico o buzón de mensaje.
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Mensaje de estado de procesamiento */}
        {processingStatus && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {processingStatus === 'PROC' && 'Procesando su pago...'}
                {processingStatus === 'PEND' && 'Pago pendiente de confirmación...'}
                {processingStatus === 'AC00' && 'Procesando con el banco...'}
                {!['PROC', 'PEND', 'AC00'].includes(processingStatus) && 'Procesando su pago, por favor espere...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inputs OTP */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-2">
        {/* Primera fila (4 inputs) */}
        <div className="flex justify-center gap-2">
          {otp.slice(0, 4).map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isDisabled}
              className="w-12 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold bg-bg-secondary border border-border-light rounded-lg focus:border-selected focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
            />
          ))}
        </div>
        
        {/* Segunda fila (4 inputs) */}
        <div className="flex justify-center gap-2">
          {otp.slice(4, 8).map((digit, index) => (
            <input
              key={index + 4}
              ref={el => { inputRefs.current[index + 4] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index + 4, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index + 4, e)}
              onPaste={handlePaste}
              disabled={isDisabled}
              className="w-12 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold bg-bg-secondary border border-border-light rounded-lg focus:border-selected focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
            />
          ))}
        </div>
      </div>

      {/* Botón confirmar */}
      <div className="flex justify-center">
        <Button
          onClick={handleConfirm}
          disabled={!isComplete || isDisabled}
          className="w-full sm:w-auto px-12"
        >
          {isVerifying ? 'Verificando...' : 'Confirmar'}
        </Button>
      </div>

      {/* Contador y reenviar */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-text-secondary">
            Espere antes de solicitar <span className="font-semibold">{countdown} seg</span>
          </p>
        ) : (
          canResend && (
            <button
              onClick={handleResend}
              disabled={isDisabled}
              className="text-sm text-selected hover:text-selected-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          )
        )}
      </div>
    </div>
  );
}

