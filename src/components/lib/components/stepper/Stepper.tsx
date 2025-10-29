import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../button';
import { StepperHeader } from './StepperHeader';
import type { StepperProps } from './types';


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
    const validatingRef = useRef<number>(0);

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

    const goBack = useCallback(async () => {
        await steps[index]?.onPrev?.(data);
        setIndex(index - 1);
    }, [index, steps, data, setIndex]);

    const goNext = useCallback(async () => {
        if (!canNext) return;
        if (index === steps.length - 1) {
            await onFinish?.(data);
            return;
        }
        await steps[index]?.onNext?.(data);
        setIndex(index + 1);
    }, [canNext, index, steps, data, setIndex, onFinish]);

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

    const footer = renderFooter
        ? renderFooter({ current: index, total: steps.length, canNext, goNext, goBack })
        : (
            <div className="mt-6 flex items-center justify-between">
                <Button variant="secondary" onClick={goBack} disabled={index === 0}>Atrás</Button>
                <div className="flex-1" />
                <Button onClick={goNext} disabled={!canNext}>
                    {index === steps.length - 1 ? finishLabel : 'Continuar'}
                </Button>
            </div>
        );

    const step = steps[index];

    return (
        <div className="w-full">
            {header}
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
                            total: steps.length
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
            {footer}
        </div>
    );
}