import * as React from 'react';
import { Input } from '../../lib/components/input';
import { Select } from '../../lib/components/select';
import { useBanks } from '../../../hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export type SypagoDebitPayload = {
  bankCode: string;
  phone: string;
  docType: 'V' | 'E' | 'J' | 'P';
  docNumber: string;
};

interface SypagoDebitProps {
  raffleTitle: string;
  selectedNumbers: number[];
  price: number;
  currency: string;
  payload: SypagoDebitPayload;
  onChange: (payload: SypagoDebitPayload) => void;
  disabled?: boolean;
}

// Validaciones
const PHONE_REGEX = /^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$/;

function validatePhone(phone: string): string | null {
  if (!phone.trim()) {
    return 'El teléfono es requerido';
  }
  // Solo números
  if (!/^\d+$/.test(phone)) {
    return 'El teléfono solo puede contener números';
  }
  // Validar formato con regex
  if (!PHONE_REGEX.test(phone)) {
    return 'El teléfono debe ser de Movistar (0414, 0424), Movilnet (0416, 0426), Digitel (0412, 0422)';
  }
  return null;
}

function validateDocNumber(docNumber: string, docType: 'V' | 'E' | 'J' | 'P'): string | null {
  if (!docNumber.trim()) {
    return 'El número de documento es requerido';
  }
  // Solo números para V, E, J
  if (docType !== 'P' && !/^\d+$/.test(docNumber)) {
    return 'El número de documento solo puede contener números';
  }
  // Longitud razonable
  if (docType === 'V' || docType === 'E') {
    if (docNumber.length < 6 || docNumber.length > 10) {
      return 'El número de documento debe tener entre 6 y 10 dígitos';
    }
  } else if (docType === 'J') {
    if (docNumber.length < 8 || docNumber.length > 12) {
      return 'El número de documento jurídico debe tener entre 8 y 12 dígitos';
    }
  }
  return null;
}

export default function SypagoDebit({ raffleTitle, selectedNumbers, price, currency, payload, onChange, disabled = false }: SypagoDebitProps) {
  const { data: banks = [], isLoading: loadingBanks, isError: errorBanks } = useBanks();

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);
  const bankOptions = React.useMemo(() => banks.map(b => ({ value: b.code, label: `${b.code} - ${b.name}` })), [banks]);
  const docTypeOptions = React.useMemo(() => [
    { value: 'V', label: 'V - Venezolano' },
    { value: 'E', label: 'E - Extranjero' },
    { value: 'J', label: 'J - Jurídico' },
    { value: 'P', label: 'P - Pasaporte' }
  ], []);

  const isFormDisabled = disabled || loadingBanks || errorBanks;
  
  const [errors, setErrors] = React.useState<{
    bankCode?: string | null;
    phone?: string | null;
    docNumber?: string | null;
  }>({});
  
  const [touched, setTouched] = React.useState<{
    bankCode?: boolean;
    phone?: boolean;
    docNumber?: boolean;
  }>({});

  // Validar todos los campos
  const isValid = React.useMemo(() => {
    return !errors.bankCode && !errors.phone && !errors.docNumber &&
           payload.bankCode.trim() && payload.phone.trim() && payload.docNumber.trim();
  }, [errors, payload]);

  // Validar en tiempo real
  React.useEffect(() => {
    const newErrors: typeof errors = {};
    
    if (touched.bankCode || payload.bankCode) {
      if (!payload.bankCode.trim()) {
        newErrors.bankCode = 'El banco es requerido';
      } else {
        newErrors.bankCode = null;
      }
    }
    if (touched.phone || payload.phone) {
      newErrors.phone = validatePhone(payload.phone);
    }
    if (touched.docNumber || payload.docNumber) {
      newErrors.docNumber = validateDocNumber(payload.docNumber, payload.docType);
    }
    
    setErrors(newErrors);
  }, [payload, touched]);

  return (
    <div className="space-y-4">
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

      {/* Formulario Sypago Debit */}
      <div className="space-y-3">
        {errorBanks && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            Error al cargar los bancos. Por favor, intenta nuevamente.
          </div>
        )}

        {/* Mensaje de error general */}
        <AnimatePresence>
          {!isValid && (touched.bankCode || touched.phone || touched.docNumber) && (
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
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Por favor, complete todos los campos correctamente para continuar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTouched({})}
                  className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  aria-label="Cerrar error"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Select
          label="Banco"
          options={bankOptions}
          placeholder={loadingBanks ? "Cargando bancos..." : "Seleccione el banco"}
          value={payload.bankCode}
          onValueChange={(value) => {
            onChange({ ...payload, bankCode: value });
            setTouched(prev => ({ ...prev, bankCode: true }));
          }}
          disabled={isFormDisabled}
        />

        <Input
          label="Teléfono"
          placeholder="04121234567"
          type="text"
          value={payload.phone}
          onChange={(e) => {
            // Solo números
            const value = e.target.value.replace(/\D/g, '');
            onChange({ ...payload, phone: value });
            setTouched(prev => ({ ...prev, phone: true }));
          }}
          onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
          disabled={isFormDisabled}
          error={touched.phone ? errors.phone : undefined}
          hasSubmitted={touched.phone}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <Select
            label="Tipo de Documento"
            options={docTypeOptions}
            value={payload.docType}
            onValueChange={(value) => {
              onChange({ ...payload, docType: value as any });
              // Resetear error de docNumber cuando cambia el tipo
              setTouched(prev => ({ ...prev, docNumber: false }));
            }}
            disabled={isFormDisabled}
          />
          <div className="md:col-span-2">
            <Input
              label="Número de Documento"
              placeholder="12345678"
              type="text"
              value={payload.docNumber}
              onChange={(e) => {
                let value = e.target.value;
                // Solo números para V, E, J
                if (payload.docType !== 'P') {
                  value = value.replace(/\D/g, '');
                }
                onChange({ ...payload, docNumber: value });
                setTouched(prev => ({ ...prev, docNumber: true }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, docNumber: true }))}
              disabled={isFormDisabled}
              error={touched.docNumber ? errors.docNumber : undefined}
              hasSubmitted={touched.docNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


