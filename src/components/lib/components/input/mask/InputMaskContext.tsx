import * as React from 'react';
import { createContext, useContext } from 'react';
import type { MaskConfig } from './patterns';

interface InputMaskContextType {
    defaultMasks: Record<string, MaskConfig>;
    registerMask: (name: string, config: MaskConfig) => void;
    getMask: (name: string) => MaskConfig | undefined;
}

const InputMaskContext = createContext<InputMaskContextType | undefined>(undefined);

export const InputMaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const [masks, setMasks] = React.useState<Record<string, MaskConfig>>({
        phone: { type: 'phone' },
        date: { type: 'date' },
        currency: { type: 'currency' }
    });

    const registerMask = React.useCallback((name: string, config: MaskConfig) => {
        setMasks(prev => ({ ...prev, [name]: config }));
    }, []);

    const getMask = React.useCallback((name: string) => {
        return masks[name];
    }, [masks]);

    const value = React.useMemo(() => ({
        defaultMasks: masks,
        registerMask,
        getMask
    }), [masks, registerMask, getMask]);

    return (
        <InputMaskContext.Provider value={value}>
            {children}
        </InputMaskContext.Provider>
    );
};

export const useInputMaskContext = () => {
    const context = useContext(InputMaskContext);
    if (!context) {
        throw new Error('useInputMaskContext debe ser usado dentro de un InputMaskProvider');
    }
    return context;
};