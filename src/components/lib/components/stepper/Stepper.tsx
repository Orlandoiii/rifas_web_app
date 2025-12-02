import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../button';
import { StepperHeader } from './StepperHeader';
import type { StepperProps } from './types';
import { extractErrorMessage } from '../../../../utils/errorMessages';


const slideVariants = {
    enterRight: { x: 32, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitLeft: { x: -32, opacity: 0 },
    enterLeft: { x: -32, opacity: 0 },
    exitRight: { x: 32, opacity: 0 },
};

export function Stepper<T>(props: StepperProps<T>) {
    const {
        steps,
        data,
        onDataChange,
        current,
        defaultCurrent = 0,
        onChange,
        storageKey,
        onFinish,
        finishLabel = 'Finalizar',
        renderHeader,
        renderFooter,
    } = props;

    const isControlled = typeof current === 'number';
    const [uncontrolledIndex, setUncontrolledIndex] = useState<number>(() => {
        if (storageKey) {
            const saved = Number(localStorage.getItem(storageKey));
            if (!Number.isNaN(saved)) return Math.min(Math.max(saved, 0), Math.max(steps.length - 1, 0));
        }
        return defaultCurrent;
    });

    const index = isControlled ? (current as number) : uncontrolledIndex;
    const setIndex = useCallback((i: number) => {
        const next = Math.min(Math.max(i, 0), Math.max(steps.length - 1, 0));
        if (!isControlled) setUncontrolledIndex(next);
        onChange?.(next);
        if (storageKey) localStorage.setItem(storageKey, String(next));
    }, [isControlled, onChange, storageKey, steps.length]);

    const [canNext, setCanNext] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const validatingRef = useRef<number>(0);
    const submitAttemptRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        let cancelled = false;
        const v = steps[index]?.validate;
        (async () => {
            validatingRef.current++;
            const id = validatingRef.current;
            if (!v) { setCanNext(true); return; }
            const result = await v(data);
            if (cancelled || id !== validatingRef.current) return;
            setCanNext(Boolean(result));
        })();
        return () => { cancelled = true; };
    }, [index, data, steps]);

    // Limpiar error y resetear submit attempt cuando cambia el paso
    useEffect(() => {
        setError(null);
        submitAttemptRef.current = null;
    }, [index]);

    const goBack = useCallback(async () => {
        if (isProcessing) return;
        setError(null);
        try {
            setIsProcessing(true);
            await steps[index]?.onPrev?.(data);
            setIndex(index - 1);
        } catch (err) {
            const message = extractErrorMessage(
              err,
              'Error al retroceder. Por favor, intente nuevamente.'
            );
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    }, [index, steps, data, setIndex, isProcessing]);

    const goNext = useCallback(async () => {
        if (isProcessing) return;
        
        // Notificar al formulario que se intentó hacer submit (para activar validaciones)
        if (submitAttemptRef.current) {
            submitAttemptRef.current();
        }
        
        // Re-validar después de activar las validaciones del formulario
        const v = steps[index]?.validate;
        if (v) {
            const isValid = await v(data);
            if (!isValid) {
                // No avanzar si no es válido, pero ya se activaron los errores del formulario
                return;
            }
        }
        
        setError(null);
        try {
            setIsProcessing(true);
            if (index === steps.length - 1) {
                await onFinish?.(data);
                return;
            }
            await steps[index]?.onNext?.(data);
            setIndex(index + 1);
        } catch (err) {
            const message = extractErrorMessage(
              err,
              'Error al continuar. Por favor, intente nuevamente.'
            );
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    }, [index, steps, data, setIndex, onFinish, isProcessing]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goBack();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNext, goBack]);

    const directionRef = useRef<'fwd' | 'back'>('fwd');
    const lastIndexRef = useRef(index);
    useEffect(() => {
        directionRef.current = index > lastIndexRef.current ? 'fwd' : 'back';
        lastIndexRef.current = index;
    }, [index]);

    const header = renderHeader
        ? renderHeader({ current: index, total: steps.length })
        : <StepperHeader current={index} total={steps.length} />;

    const handleSubmitAttempt = useCallback((callback: () => void) => {
        // Los formularios pueden registrar su función de activación de validaciones
        submitAttemptRef.current = callback;
    }, []);

    const footer = renderFooter
        ? renderFooter({ current: index, total: steps.length, canNext, goNext, goBack, isProcessing })
        : (
            <div className="mt-6 flex items-center justify-between">
                <Button variant="secondary" onClick={goBack} disabled={index === 0 || isProcessing}>Atrás</Button>
                <div className="flex-1" />
                <Button onClick={goNext} disabled={isProcessing}>
                    {isProcessing ? 'Procesando...' : (index === steps.length - 1 ? finishLabel : 'Continuar')}
                </Button>
            </div>
        );

    const step = steps[index];

    return (
        <div className="w-full">
            {header}
            
            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h3>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative min-h-[180px]">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={step?.id ?? index}
                        initial={directionRef.current === 'fwd' ? 'enterRight' : 'enterLeft'}
                        animate="center"
                        exit={directionRef.current === 'fwd' ? 'exitLeft' : 'exitRight'}
                        variants={slideVariants}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="w-full"
                    >
                        {step?.render({
                            data,
                            setData: onDataChange,
                            goNext,
                            goBack,
                            index,
                            total: steps.length,
                            isProcessing,
                            onSubmitAttempt: handleSubmitAttempt
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
            {footer}
        </div>
    );
}