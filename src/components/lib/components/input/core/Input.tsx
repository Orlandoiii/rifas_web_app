import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Label } from './Label';
import { InputError } from './InputError';
import { InputTooltip } from './InputTooltip';
import { cn } from '../../../utils';

const inputVariants = cva(
    [
        'w-full', // Retiramos 'peer'
        'bg-transparent',
        'text-sm',
        'text-text-primary',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
        'disabled:border-border-light',

        '[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_var(--color-bg-tertiary)_inset]',
        '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-text-primary)]',
    ],
    {
        variants: {
            variant: {
                classic:
                    'h-11 px-3 py-2 border rounded-lg border-border-light hover:border-selected focus:border-selected',
                floating:
                    'h-11.5 px-1  pt-5 border-b border-border-light hover:border-selected focus:border-selected focus:border-b-2',
            },
        },
        defaultVariants: {
            variant: 'classic',
        },
    }
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    variant?: VariantProps<typeof inputVariants>['variant'];
    containerClassName?: string;
    labelClassName?: string;
    error?: React.ReactNode;
    hasSubmitted?: boolean;
    showTooltip?: boolean;
    showDownErr?: boolean;
    children?: React.ReactNode;
    // Controla si se muestra el tooltip de error
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            variant,
            className,
            containerClassName,
            labelClassName,
            error,
            hasSubmitted = false,
            showTooltip = true,
            showDownErr = false,
            id: propId,
            onChange,
            children,
            ...props
        },
        ref
    ) => {
        const internalId = React.useId();
        const id = propId || internalId;
        const [isFilled, setIsFilled] = React.useState(false);

        React.useEffect(() => {

            if (props.value || props.defaultValue) {
                setIsFilled(true);
            }
        }, [props.value, props.defaultValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setIsFilled(e.target.value !== '');
            if (onChange) {
                onChange(e);
            }
        };

        const isFloating = variant === 'floating';

        return (
            <div
                className={cn('group relative flex flex-col', containerClassName)}
                data-filled={isFilled}
            >
                {label && (
                    <Label
                        htmlFor={id}
                        variant={isFloating ? 'floating' : 'classic'}
                        className={labelClassName}
                        data-submitted={hasSubmitted}
                        data-error={!!error}
                    >
                        {label}
                    </Label>
                )}
                <div className="relative flex items-center">
                    <input
                        id={id}
                        ref={ref}
                        className={cn(
                            inputVariants({ variant }),
                            className
                        )}
                        onChange={handleChange}
                        {...props}
                    />
                    {children}
                </div>
                {showDownErr && (
                    <InputError
                        error={error}
                        hasSubmitted={hasSubmitted}
                    />
                )}
                {showTooltip && (
                    <InputTooltip error={error} />
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
