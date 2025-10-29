export type StepRenderArgs<T> = {
    data: T;
    setData: (updater: (d: T) => T) => void;
    goNext: () => void;
    goBack: () => void;
    index: number;
    total: number;
};

export type Step<T> = {
    id: string;
    title?: string;
    optional?: boolean;
    render: (args: StepRenderArgs<T>) => React.ReactNode;
    validate?: (data: T) => boolean | Promise<boolean>;
    onNext?: (data: T) => void | Promise<void>;
    onPrev?: (data: T) => void | Promise<void>;
};

export type StepperProps<T> = {
    steps: Step<T>[];
    data: T;
    onDataChange: (updater: (d: T) => T) => void;

    current?: number;
    defaultCurrent?: number;
    onChange?: (index: number) => void;

    storageKey?: string; 
    onFinish?: (data: T) => void | Promise<void>;
    finishLabel?: string;

    renderHeader?: (ctx: { current: number; total: number }) => React.ReactNode;
    renderFooter?: (ctx: {
        current: number;
        total: number;
        canNext: boolean;
        goNext: () => void;
        goBack: () => void;
    }) => React.ReactNode;
};