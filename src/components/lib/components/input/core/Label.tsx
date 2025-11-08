import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils';

export const labelVariants = cva(
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        classic: ['block', 'text-sm', 'font-medium', 'transition-all', 'duration-200', 'text-text-primary', 'mb-2'],
        floating: [
          'absolute',
          'transition-all',
          'duration-200',
          'pointer-events-none',
          // Por defecto, el label está arriba y pequeño
          'left-1',
          'top-1',
          'text-xs',
          'text-text-primary',
          'font-semibold',
          // Cuando el input NO tiene contenido Y el grupo NO tiene foco, se mueve al centro
          'group-data-[filled=false]:group-[:not(:focus-within)]:top-1/2',
          'group-data-[filled=false]:group-[:not(:focus-within)]:text-base',
          'group-data-[filled=false]:group-[:not(:focus-within)]:-translate-y-1/2',
        ],
      },
    },
    defaultVariants: {
      variant: 'classic',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> { }

export const Label = ({ className, variant, ...props }: LabelProps) => {
  return (
    <label
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  );
};
