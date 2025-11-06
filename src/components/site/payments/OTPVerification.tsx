import * as React from 'react';
import { Button } from '../../lib/components/button';

interface OTPVerificationProps {
  raffleTitle: string;
  selectedNumbers: number[];
  price: number;
  currency: string;
  onVerify: (otp: string) => void;
  disabled?: boolean;
  countdown?: number;
  onResend?: () => void;
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
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);

  // Auto-focus en el primer input cuando se monta el componente
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

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

  const handleConfirm = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 8) {
      onVerify(otpValue);
    }
  };

  const isComplete = otp.every(digit => digit !== '');
  const canResend = countdown === 0 && onResend;

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
              disabled={disabled}
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
              disabled={disabled}
              className="w-12 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold bg-bg-secondary border border-border-light rounded-lg focus:border-selected focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
            />
          ))}
        </div>
      </div>

      {/* Botón confirmar */}
      <div className="flex justify-center">
        <Button
          onClick={handleConfirm}
          disabled={!isComplete || disabled}
          className="w-full sm:w-auto px-12"
        >
          Confirmar
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
              onClick={onResend}
              disabled={disabled}
              className="text-sm text-selected hover:text-selected-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reenviar código
            </button>
          )
        )}
      </div>
    </div>
  );
}

