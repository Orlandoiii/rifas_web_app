import * as React from 'react';
import { forwardRef } from 'react';
import { Input, type InputProps } from '../core/Input';
import { useInputMask } from './useInputMask';
import type { MaskConfig } from './patterns';

export interface MaskedInputProps extends Omit<InputProps, 'onChange'> {
  mask: MaskConfig;
  
  onChange?: (value: string, rawValue: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRawChange?: (rawValue: string) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {
  const { mask, onChange, onRawChange, value, defaultValue, ...restProps } = props;
  
  const { formatValue, removeMask, maskPlaceholder } = useInputMask(mask);
  
  const [internalValue, setInternalValue] = React.useState(() => {
    const initialValue = value || defaultValue || '';
    return formatValue(String(initialValue));
  });

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(formatValue(String(value)));
    }
  }, [value, formatValue]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeMask(event.target.value);
    const formattedValue = formatValue(event.target.value);
    
    setInternalValue(formattedValue);
    
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        value: formattedValue
      }
    };

    if (onChange) {
      onChange(formattedValue, rawValue, newEvent as React.ChangeEvent<HTMLInputElement>);
    }
    if (onRawChange) {
      onRawChange(rawValue);
    }
  }, [removeMask, formatValue, onChange, onRawChange]);

  return (
    <Input
      {...restProps}
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      placeholder={restProps.placeholder || maskPlaceholder}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';