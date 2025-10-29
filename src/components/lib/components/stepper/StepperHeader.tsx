
export function StepperHeader({ current, total }: { current: number; total: number }) {
    const pct = total > 1 ? ((current + 1) / total) * 100 : 100;
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">Paso {current + 1} de {total}</span>
            </div>
            <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border-light">
                <div
                    className="h-full bg-selected transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}