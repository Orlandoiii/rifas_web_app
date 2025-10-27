import { useCallback, useMemo } from 'react';
import type { MaskConfig } from './patterns';
import { MASK_PATTERNS } from './patterns';

export const useInputMask = (config: MaskConfig) => {
   
    const { type, pattern: customPattern, placeholder, allowEmpty = false } = config;

    const maskPattern = useMemo(() => {
        if (type === 'custom' && customPattern) {
            return customPattern;
        }
        return MASK_PATTERNS[type as keyof typeof MASK_PATTERNS]?.pattern || '';
    }, [type, customPattern]);

    const maskPlaceholder = useMemo(() => {
        if (placeholder) return placeholder;
        if (type === 'custom' && customPattern) {
            return customPattern.replace(/9/g, '0');
        }
        return MASK_PATTERNS[type as keyof typeof MASK_PATTERNS]?.placeholder || '';
    }, [type, customPattern, placeholder]);

    const applyCurrencyMask = useCallback((value: string): string => {
        if (!value) return '0,00';
        
        const numbers = value.replace(/\D/g, '');
        
        if (numbers === '') return '0,00';
        
        // Convertir a centavos (cada dígito representa un centavo)
        const cents = parseInt(numbers, 10);
        
        // Convertir centavos a formato de moneda
        const bolivares = Math.floor(cents / 100);
        const centimos = cents % 100;
        
        // Formatear bolívares con puntos para miles
        const formattedBolivares = bolivares.toLocaleString('es-ES');
        
        // Formatear centavos con dos dígitos
        const formattedCentimos = centimos.toString().padStart(2, '0');
        
        return `${formattedBolivares},${formattedCentimos}`;
    }, []);

    const applyMask = useCallback((value: string): string => {
        if (!value || !maskPattern) return value;

        if (type === 'currency') {
            return applyCurrencyMask(value);
        }

        let result = '';
        let valueIndex = 0;

        for (let i = 0; i < maskPattern.length && valueIndex < value.length; i++) {
            const maskChar = maskPattern[i];
            const valueChar = value[valueIndex];

            if (maskChar === '9') {
                if (/\d/.test(valueChar)) {
                    result += valueChar;
                    valueIndex++;
                } else {
                    valueIndex++;
                }
            } else {
                result += maskChar;
                if (valueChar === maskChar) {
                    valueIndex++;
                }
            }
        }

        return result;
    }, [maskPattern, type, applyCurrencyMask]);

    const removeCurrencyMask = useCallback((value: string): string => {
        if (!value) return '0';
        
        const numbers = value.replace(/\D/g, '');
        
        if (numbers === '') return '0';
        
        const parts = value.split(',');
        if (parts.length === 2) {
            const bolivares = parts[0].replace(/\./g, ''); // Remover puntos de miles
            const centimos = parts[1].padEnd(2, '0').substring(0, 2); // Asegurar 2 dígitos
            
            // Convertir a valor decimal en bolívares
            const valorDecimal = parseFloat(bolivares) + (parseFloat(centimos) / 100);
            return valorDecimal.toString();
        }
        
        return numbers;
    }, []);

    const removeMask = useCallback((value: string): string => {
        if (!value) return '';

        if (type === 'currency') {
            return removeCurrencyMask(value);
        }

        return value.replace(/\D/g, '');
    }, [type, removeCurrencyMask]);

    const formatValue = useCallback((value: string): string => {
        if (!value && !allowEmpty) {
            if (type === 'currency') return '0,00';
            return '';
        }
        return applyMask(value);
    }, [applyMask, allowEmpty, type]);

    return {
        formatValue,
        removeMask,
        maskPlaceholder,
        maskPattern
    };
};