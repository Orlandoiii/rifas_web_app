import * as React from 'react';
import { Input } from '../lib/components/input';
import { Button } from '../lib/components/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

type Buyer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

interface UserDataFormProps {
  raffleTitle: string;
  price: number;
  currency: string;
  selectedNumbers: number[];
  buyer: Buyer;
  onChange: (buyer: Buyer) => void;
  disabled?: boolean;
  onClearData?: () => void;
  hasStoredData?: boolean;
  onSubmitAttempt?: (callback: () => void) => void;
}

// Validaciones
const PHONE_REGEX = /^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name: string): string | null {
  if (!name.trim()) {
    return 'El nombre es requerido';
  }
  // Contar espacios
  const spaceCount = (name.match(/\s/g) || []).length;
  if (spaceCount > 1) {
    return 'El nombre solo puede tener un espacio (nombre y apellido)';
  }
  // Verificar caracteres especiales (solo permitir letras, espacios y acentos)
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    return 'El nombre solo puede contener letras y un espacio';
  }
  return null;
}

function validateId(id: string): string | null {
  if (!id.trim()) {
    return 'La cédula es requerida';
  }
  // Solo números
  if (!/^\d+$/.test(id)) {
    return 'La cédula solo puede contener números';
  }
  // Longitud razonable (entre 6 y 10 dígitos)
  if (id.length < 6 || id.length > 10) {
    return 'La cédula debe tener entre 6 y 10 dígitos';
  }
  return null;
}

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

function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'El correo es requerido';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'El correo electrónico no es válido';
  }
  return null;
}

export default function UserDataForm({ 
  raffleTitle, 
  price, 
  currency,
  selectedNumbers, 
  buyer, 
  onChange, 
  disabled = false,
  onClearData,
  hasStoredData = false,
  onSubmitAttempt
}: UserDataFormProps) {

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);
  
  const [errors, setErrors] = React.useState<{
    id?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  }>({});
  
  const [touched, setTouched] = React.useState<{
    id?: boolean;
    name?: boolean;
    phone?: boolean;
    email?: boolean;
  }>({});

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  // Registrar función de activación de validaciones con el stepper
  React.useEffect(() => {
    if (onSubmitAttempt) {
      onSubmitAttempt(() => {
        // Marcar todos los campos como touched cuando se intenta hacer submit
        setTouched({
          id: true,
          name: true,
          phone: true,
          email: true
        });
        setHasAttemptedSubmit(true);
      });
    }
  }, [onSubmitAttempt]);

  // Validar todos los campos
  const isValid = React.useMemo(() => {
    return !errors.id && !errors.name && !errors.phone && !errors.email &&
           buyer.id.trim() && buyer.name.trim() && buyer.phone.trim() && buyer.email.trim();
  }, [errors, buyer]);

  // Validar en tiempo real - solo mostrar errores si el campo fue touched O si ya se intentó hacer submit
  React.useEffect(() => {
    const newErrors: typeof errors = {};
    
    if (touched.id || (hasAttemptedSubmit && buyer.id)) {
      newErrors.id = validateId(buyer.id);
    }
    if (touched.name || (hasAttemptedSubmit && buyer.name)) {
      newErrors.name = validateName(buyer.name);
    }
    if (touched.phone || (hasAttemptedSubmit && buyer.phone)) {
      newErrors.phone = validatePhone(buyer.phone);
    }
    if (touched.email || (hasAttemptedSubmit && buyer.email)) {
      newErrors.email = validateEmail(buyer.email);
    }
    
    setErrors(newErrors);
  }, [buyer, touched, hasAttemptedSubmit]);

  const handleField = (key: keyof Buyer) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Aplicar filtros según el campo
    if (key === 'name') {
      // Solo permitir letras, espacios y caracteres acentuados
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      // Limitar a un espacio máximo
      const parts = value.split(/\s+/);
      if (parts.length > 2) {
        value = parts.slice(0, 2).join(' ');
      }
    } else if (key === 'id') {
      // Solo números
      value = value.replace(/\D/g, '');
    } else if (key === 'phone') {
      // Solo números
      value = value.replace(/\D/g, '');
    }
    
    onChange({ ...buyer, [key]: value });
    setTouched(prev => ({ ...prev, [key]: true }));
  };

  const handleClearData = () => {
    if (onClearData) {
      onClearData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-tertiary/40 border border-border-light rounded-lg p-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-text-primary font-semibold truncate">{raffleTitle}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-text-secondary">Tickets:
              <span className="text-text-primary font-semibold">{selectedNumbers.length}</span>
            </span>
            <span className="text-text-secondary">Total:
              <span className="text-selected font-semibold">{total.toFixed(2)} {currency}</span>
            </span>
          </div>
        </div>
        {selectedNumbers?.length ? (
          <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-auto">
            {selectedNumbers.slice().sort((a, b) => a - b).map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded-md bg-bg-secondary 
              border border-border-light text-text-primary">#{n}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Botón limpiar datos guardados */}
      {hasStoredData && onClearData && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Datos guardados de compras anteriores
            </span>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleClearData}
            disabled={disabled}
            className="text-sm"
          >
            Limpiar datos
          </Button>
        </div>
      )}

      {/* Mensaje de error general - solo mostrar si se intentó hacer submit */}
      <AnimatePresence>
        {!isValid && hasAttemptedSubmit && (
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
                onClick={() => {
                  setTouched({});
                  setHasAttemptedSubmit(false);
                }}
                className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                aria-label="Cerrar error"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Cédula"
            placeholder="12345678"
            value={buyer.id}
            onChange={handleField('id')}
            onBlur={() => setTouched(prev => ({ ...prev, id: true }))}
            disabled={disabled}
            type="text"
            error={(touched.id || hasAttemptedSubmit) ? errors.id : undefined}
            hasSubmitted={touched.id || hasAttemptedSubmit}
          />
        </div>
        <div>
          <Input
            label="Nombre y Apellido"
            placeholder="Juan Pérez"
            value={buyer.name}
            onChange={handleField('name')}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            disabled={disabled}
            type="text"
            error={(touched.name || hasAttemptedSubmit) ? errors.name : undefined}
            hasSubmitted={touched.name || hasAttemptedSubmit}
          />
        </div>
        <div>
          <Input
            label="Teléfono"
            placeholder="04121234567"
            value={buyer.phone}
            onChange={handleField('phone')}
            onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
            disabled={disabled}
            type="text"
            error={(touched.phone || hasAttemptedSubmit) ? errors.phone : undefined}
            hasSubmitted={touched.phone || hasAttemptedSubmit}
          />
        </div>
        <div>
          <Input
            label="Correo"
            type="email"
            placeholder="correo@dominio.com"
            value={buyer.email}
            onChange={handleField('email')}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            disabled={disabled}
            error={(touched.email || hasAttemptedSubmit) ? errors.email : undefined}
            hasSubmitted={touched.email || hasAttemptedSubmit}
          />
        </div>
      </div>
    </div>
  );
}


