import * as React from 'react';
import { cn } from '../../../utils';

export interface InputTooltipProps {
  error?: React.ReactNode;
  className?: string;
}

export const InputTooltip: React.FC<InputTooltipProps> = ({
  error,
  className,
}) => {
  if (!error) return null;

  return (
    <div className="absolute right-0 top-5 -translate-y-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
      <div className={cn(
        "px-2 py-1 rounded text-md text-black max-w-[200px] shadow-md",
        "bg-selected",
        "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-selected",
        className
      )}>
        {error}
      </div>
    </div>
  );
};
