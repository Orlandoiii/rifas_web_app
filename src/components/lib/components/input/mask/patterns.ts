export type MaskType = 
  | 'phone' 
  | 'date' 
  | 'currency' 
  | 'custom';

export interface MaskConfig {
  type: MaskType;
  pattern?: string; // Para máscaras personalizadas
  placeholder?: string;
  allowEmpty?: boolean;
}

// Definiciones de máscaras predefinidas
export const MASK_PATTERNS = {
  phone: {
    pattern: '9999-999-99-99',
    placeholder: '0412-123-45-67'
  },
  date: {
    pattern: '99/99/9999',
    placeholder: '25/12/2025'
  },
  currency: {
    pattern: '999.999.999,99',
    placeholder: '00,00'
  }
} as const;
