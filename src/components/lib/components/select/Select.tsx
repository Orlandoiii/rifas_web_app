import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const selectVariants = cva(
  [
    'w-full',
    'bg-bg-secondary',
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
    'pr-10', // Espacio para el icono de flecha
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

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  variant?: VariantProps<typeof selectVariants>['variant'];
  containerClassName?: string;
  labelClassName?: string;
  error?: string;
  hasSubmitted?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  variant = 'classic',
  className,
  containerClassName,
  labelClassName,
  error,
  hasSubmitted = false,
  options = [],
  placeholder,
  value,
  onValueChange,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = variant === 'floating';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Determinar si el label debe flotar (como en el Input)
  const shouldFloat = isFloating && (isFocused || !!value);

  return (
    <div 
      className={cn('group relative', containerClassName)}
      data-filled={!!value}
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
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            selectVariants({ variant }),
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Icono de flecha personalizado */}
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-text-secondary"
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
