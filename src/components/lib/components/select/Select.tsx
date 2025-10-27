import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const selectVariants = cva(
  [
    'w-full',
    'bg-transparent',
    'text-sm',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'disabled:border-border-light',
    'appearance-none',
    'cursor-pointer',
    'text-text-primary',
  ],
  {
    variants: {
      variant: {
        classic:
          'h-11 px-3 py-2 border rounded-lg border-border-light hover:border-selected focus:border-selected',
        floating:
          'h-11.5 px-1 pt-5 border-b border-border-light hover:border-selected focus:border-selected focus:border-b-2',
      },
    },
    defaultVariants: {
      variant: 'classic',
    },
  }
);

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: VariantProps<typeof selectVariants>['variant'];
  containerClassName?: string;
  labelClassName?: string;
  error?: string;
  hasSubmitted?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  direction?: 'up' | 'down';
}

export const Select = forwardRef<HTMLInputElement, SelectProps>(({
  label,
  variant = 'classic',
  className,
  containerClassName,
  labelClassName,
  error,
  hasSubmitted = false,
  options = [],
  placeholder,
  value: externalValue,
  onValueChange,
  onChange,
  direction = 'down',
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFloating = variant === 'floating';

  useEffect(() => {
    setInternalValue(externalValue || '');
  }, [externalValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: { value: string; label: string }) => {
    setInternalValue(option.value);
    setIsOpen(false);
    setIsFocused(false);
    
    if (onValueChange) {
      onValueChange(option.value);
    }
    
    if (onChange) {
      // Crear un evento sintético para mantener compatibilidad
      const syntheticEvent = {
        target: { value: option.value }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setIsFocused(true);
  };

  const selectedOption = options.find(option => option.value === internalValue);
  const displayValue = selectedOption ? selectedOption.label : '';
  
  // Determinar si el label debe flotar (como en el Input)
  const shouldFloat = isFloating && (isFocused || !!displayValue);

  // Clases para el dropdown según la dirección
  const dropdownClasses = cn(
    'absolute w-full z-10 border border-border-light rounded-lg overflow-hidden bg-bg-tertiary shadow-lg',
    direction === 'up' 
      ? 'bottom-full mb-1' 
      : 'top-full mt-1'
  );

  return (
    <div 
      ref={containerRef} 
      className={cn('group relative', containerClassName)}
      data-filled={!!displayValue}
      data-focused={isFocused}
    >
      {label && (
        <label
          htmlFor={props.id}
          className={cn(
            'block text-sm font-medium transition-all duration-200',
            isFloating
              ? shouldFloat
                ? 'absolute left-1 top-1 text-text-muted group-focus-within:text-selected group-data-[filled=true]:text-selected group-data-[error=true]:text-state-error'
                : 'absolute left-1 top-1/2 transform -translate-y-1/2 text-text-muted group-focus-within:text-selected group-data-[error=true]:text-state-error'
              : 'mb-2 text-text-primary',
            labelClassName
          )}
          data-submitted={hasSubmitted}
          data-error={!!error}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          value={displayValue}
          readOnly
          onFocus={handleFocus}
          className={cn(
            selectVariants({ variant }),
            className
          )}
          placeholder={isFloating ? undefined : placeholder}
          {...props}
        />
        
        {/* Icono de flecha personalizado */}
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={cn(
              'w-4 h-4 text-text-secondary transition-transform duration-200',
              isOpen && (direction === 'down' ? 'rotate-180' : 'rotate-0')
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown de opciones */}
      {isOpen && (
        <div className={dropdownClasses}>
          <div className="max-h-48 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-text-muted">
                Sin opciones disponibles
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className={cn(
          'mt-1 text-xs transition-all duration-300',
          hasSubmitted 
            ? 'text-error opacity-100' 
            : 'text-text-muted opacity-70'
        )}>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
