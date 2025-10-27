import * as React from 'react';
import { cn } from '../../../utils';

export interface InputErrorProps {
  error?: React.ReactNode;
  hasSubmitted?: boolean;
  className?: string;
}

export const InputError: React.FC<InputErrorProps> = ({
  error,
  hasSubmitted = false,
  className,
}) => {
  if (!error) return null;

  return (
    <p className={cn(
      "absolute top-full text-xs transition-all duration-300 ease-in-out",
      error
        ? "opacity-100 translate-y-0 mt-1"
        : "opacity-0 -translate-y-2 pointer-events-none",
      hasSubmitted ? "text-error" : "text-text-muted",
      className
    )}>
      {error}
    </p>
  );
};
