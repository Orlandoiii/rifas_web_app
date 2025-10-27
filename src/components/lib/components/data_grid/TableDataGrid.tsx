import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table"

import type {
    ColumnDef,
    SortingState,
    VisibilityState,
    Row,
} from "@tanstack/react-table"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader } from '../loader/Loader'

interface FilterOption {
    column: string;
    operator: 'igual' | 'similar' | 'mayor' | 'menor' | 'mayorIgual' | 'menorIgual' | 'empieza' | 'termina' | 'vacio' | 'noVacio' | 'diferente';
    value: string;
}

type CustomFilterFn = {
    value: string;
    operator: 'igual' | 'similar' | 'mayor' | 'menor' | 'mayorIgual' | 'menorIgual' | 'empieza' | 'termina' | 'vacio' | 'noVacio' | 'diferente';
}

type FilterOperator = 'igual' | 'similar' | 'mayor' | 'menor' | 'mayorIgual' | 'menorIgual' | 'empieza' | 'termina' | 'vacio' | 'noVacio' | 'diferente';

const customFilterFn = <TData extends unknown>(
    row: Row<TData>,
    columnId: string,
    filterValue: CustomFilterFn
): boolean => {
    const cellValue = row.getValue(columnId)?.toString().toLowerCase() ?? ''
    const searchValue = filterValue.value.toLowerCase()

    switch (filterValue.operator) {
        case 'igual':
            return cellValue === searchValue;
        case 'diferente':
            return cellValue !== searchValue;
        case 'similar':
            return cellValue.includes(searchValue);
        case 'mayor':
            return Number(cellValue) > Number(searchValue);
        case 'menor':
            return Number(cellValue) < Number(searchValue);
        case 'mayorIgual':
            return Number(cellValue) >= Number(searchValue);
        case 'menorIgual':
            return Number(cellValue) <= Number(searchValue);
        case 'empieza':
            return cellValue.startsWith(searchValue);
        case 'termina':
            return cellValue.endsWith(searchValue);
        case 'vacio':
            return cellValue === '' || cellValue === null || cellValue === undefined;
        case 'noVacio':
            return cellValue !== '' && cellValue !== null && cellValue !== undefined;
        default:
            return true;
    }
}

// Navigation Buttons
function BackwardButton({ onClick, disabled = false }: { onClick: () => void, disabled: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center rounded-md p-2 px-3 transition-colors duration-200 ${disabled
                ? 'cursor-not-allowed text-text-muted'
                : 'cursor-pointer text-selected hover:text-selected hover:bg-bg-secondary'
                }`}
            disabled={disabled}
        >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 18 18">
                <path d="M12.1777 16.1156C12.009 16.1156 11.8402 16.0593 11.7277 15.9187L5.37148 9.44995C5.11836 9.19683 5.11836 8.80308 5.37148 8.54995L11.7277 2.0812C11.9809 1.82808 12.3746 1.82808 12.6277 2.0812C12.8809 2.33433 12.8809 2.72808 12.6277 2.9812L6.72148 8.99995L12.6559 15.0187C12.909 15.2718 12.909 15.6656 12.6559 15.9187C12.4871 16.0312 12.3465 16.1156 12.1777 16.1156Z" />
            </svg>
        </button>
    )
}

function ForwardButton({ onClick, disabled = false }: { onClick: () => void, disabled: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center rounded-md p-2 px-3 transition-colors duration-200 ${disabled
                ? 'cursor-not-allowed text-text-muted'
                : 'cursor-pointer text-text-secondary hover:text-selected hover:bg-bg-secondary'
                }`}
        >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 18 18">
                <path d="M5.82148 16.1156C5.65273 16.1156 5.51211 16.0593 5.37148 15.9468C5.11836 15.6937 5.11836 15.3 5.37148 15.0468L11.2777 8.99995L5.37148 2.9812C5.11836 2.72808 5.11836 2.33433 5.37148 2.0812C5.62461 1.82808 6.01836 1.82808 6.27148 2.0812L12.6277 8.54995C12.8809 8.80308 12.8809 9.19683 12.6277 9.44995L6.27148 15.9187C6.15898 16.0312 5.99023 16.1156 5.82148 16.1156Z" />
            </svg>
        </button>
    )
}

function NumberButton({ number = 1, active = false, onClick }: { number: number | string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`h-8 mx-1 flex items-center justify-center rounded-md p-1 px-3 transition-colors duration-200 ${active
                ? 'bg-selected text-bg-primary font-semibold'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-selected'
                }`}
        >
            {number}
        </button>
    )
}

function SortIcon({ isSorted }: { isSorted: string }) {
    return (
        <span className="inline-flex flex-col space-y-[3px]">
            <span className="inline-block">
                <svg
                    className={`${isSorted && isSorted == 'asc' ? 'fill-selected' : 'fill-text-muted'}`}
                    width="10"
                    height="5"
                    viewBox="0 0 10 5"
                >
                    <path d="M5 0L0 5H10L5 0Z" />
                </svg>
            </span>
            <span className="inline-block">
                <svg
                    className={`${isSorted && isSorted == 'desc' ? 'fill-selected' : 'fill-text-muted'}`}
                    width="10"
                    height="5"
                    viewBox="0 0 10 5"
                >
                    <path d="M5 5L10 0L-4.37114e-07 8.74228e-07L5 5Z" />
                </svg>
            </span>
        </span>
    )
}

// Filter Dialog
function FilterDialog({
    columns,
    onApplyFilter,
    activeFilters,
    onRemoveFilter,
    isOpen,
    onClose
}: {
    columns: any[],
    activeFilters: FilterOption[],
    onApplyFilter: (filter: FilterOption) => void,
    onRemoveFilter: (index: number) => void,
    isOpen: boolean,
    onClose: () => void
}) {
    const [selectedColumn, setSelectedColumn] = useState('')
    const [selectedOperator, setSelectedOperator] = useState<FilterOperator>('igual')
    const [filterValue, setFilterValue] = useState('')

    const visibleColumns = columns.filter(col => col.getIsVisible())
    const requiresValue = !['vacio', 'noVacio'].includes(selectedOperator)

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-bg-secondary border border-border-light rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-primary text-lg font-semibold">Filtros Activos ({activeFilters.length})</h3>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-selected transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {activeFilters.length > 0 && (
                    <div className="border border-border-light rounded-md p-3 mb-4 bg-bg-tertiary">
                        {activeFilters.map((filter, index) => (
                            <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
                                <span className="text-text-secondary text-sm">
                                    {columns.find(col => col.id === filter.column)?.columnDef.header?.toString()}:
                                    {' '}{getOperatorLabel(filter.operator)}
                                    {!['vacio', 'noVacio'].includes(filter.operator) ? ` "${filter.value}"` : ''}
                                </span>
                                <button
                                    onClick={() => onRemoveFilter(index)}
                                    className="ml-2 p-1 hover:bg-bg-secondary rounded-full text-text-muted hover:text-state-error transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-text-primary text-sm font-medium">Columna</label>
                        <select
                            className="bg-bg-tertiary border border-border-light text-text-primary p-2 rounded-md focus:border-selected focus:outline-none"
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                        >
                            <option value="">Seleccionar columna</option>
                            {visibleColumns.map(col => (
                                <option key={col.id} value={col.id}>
                                    {col.columnDef.header?.toString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-text-primary text-sm font-medium">Operador</label>
                        <select
                            className="bg-bg-tertiary border border-border-light text-text-primary p-2 rounded-md focus:border-selected focus:outline-none"
                            value={selectedOperator}
                            onChange={(e) => setSelectedOperator(e.target.value as FilterOperator)}
                        >
                            <option value="igual">Igual</option>
                            <option value="diferente">Diferente</option>
                            <option value="similar">Contiene</option>
                            <option value="mayor">Mayor que</option>
                            <option value="menor">Menor que</option>
                            <option value="mayorIgual">Mayor o igual que</option>
                            <option value="menorIgual">Menor o igual que</option>
                            <option value="empieza">Empieza con</option>
                            <option value="termina">Termina con</option>
                            <option value="vacio">Está vacío</option>
                            <option value="noVacio">No está vacío</option>
                        </select>
                    </div>

                    {requiresValue && (
                        <div className="flex flex-col gap-2">
                            <label className="text-text-primary text-sm font-medium">Valor</label>
                            <input
                                type="text"
                                className="bg-bg-tertiary border border-border-light text-text-primary p-2 rounded-md focus:border-selected focus:outline-none"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="bg-bg-tertiary text-text-secondary px-4 py-2 rounded-md hover:bg-bg-primary transition-colors duration-200"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="bg-selected text-bg-primary px-4 py-2 rounded-md hover:bg-mint-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                            onApplyFilter({
                                column: selectedColumn,
                                operator: selectedOperator,
                                value: requiresValue ? filterValue : ''
                            });
                            setSelectedColumn('');
                            setFilterValue('');
                        }}
                        disabled={!selectedColumn || (requiresValue && !filterValue)}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    )
}

function getOperatorLabel(operator: FilterOperator): string {
    const operatorLabels: Record<FilterOperator, string> = {
        'igual': 'Igual a',
        'diferente': 'Diferente de',
        'similar': 'Contiene',
        'mayor': 'Mayor que',
        'menor': 'Menor que',
        'mayorIgual': 'Mayor o igual que',
        'menorIgual': 'Menor o igual que',
        'empieza': 'Empieza con',
        'termina': 'Termina con',
        'vacio': 'Está vacío',
        'noVacio': 'No está vacío'
    };
    return operatorLabels[operator] || operator;
}

// Columns Visibility Dialog
function VisibleColumnsDialog({
    table,
    isOpen,
    onClose
}: {
    table: any,
    isOpen: boolean,
    onClose: () => void
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-bg-secondary border border-border-light rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-primary text-lg font-semibold">Columnas Visibles</h3>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-selected transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col space-y-3 max-h-96 overflow-y-auto">
                    {table.getAllLeafColumns().map((column: any) => {
                        return (
                            <div key={column.id} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={column.getIsVisible()}
                                    onChange={(e) => column.toggleVisibility(e.target.checked)}
                                    id={column.id}
                                    className="w-4 h-4 text-selected bg-bg-tertiary border-border-light rounded focus:ring-selected focus:ring-2"
                                />
                                <label htmlFor={column.id} className="text-text-primary text-sm font-medium cursor-pointer">
                                    {column.columnDef.header?.toString()}
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}



export interface DataGridProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    onEdit?: (row: Row<TData>) => void
    onView?: (row: Row<TData>) => void
    onDoubleClick?: (row: Row<TData>) => void
    enableEdit?: boolean
    enableView?: boolean
    enableExport?: boolean
    initialColumnVisibility?: VisibilityState
}

export function DataGrid<TData, TValue>({
    columns,
    data,
    isLoading,
    onEdit,
    onView,
    onDoubleClick,
    enableEdit = true,
    enableView = true,
    enableExport = true,
    initialColumnVisibility = {}
}: DataGridProps<TData, TValue>) {

    const columnsMemo = useMemo(() => columns, [columns])
    const dataMemo = useMemo(() => data, [data])

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
    const inputSetPageRef = useRef<HTMLInputElement>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility)
    const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [showColumnsDialog, setShowColumnsDialog] = useState(false);

    const table = useReactTable({
        data: dataMemo,
        columns: columnsMemo,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            custom: customFilterFn,
        },
        state: {
            pagination,
            sorting,
            globalFilter,
            columnVisibility,
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
    })

    useEffect(() => {
        table.getAllColumns().forEach(column => {
            column.setFilterValue(undefined)
        })

        activeFilters.forEach(filter => {
            const column = table.getColumn(filter.column)
            if (column) {
                column.setFilterValue({
                    value: filter.value,
                    operator: filter.operator,
                })
            }
        })
    }, [activeFilters])

    const handleExport = useCallback(() => {
        const exportFileName = "export"
        const rowsToExport = table.getFilteredRowModel().rows.map(row => row.original);
        const visibleColumns = table.getVisibleLeafColumns()
            .filter(column => column.id !== 'select')
            .map(column => ({
                id: column.id,
                header: column.columnDef.header?.toString() || column.id
            }));

        const csvContent = [
            visibleColumns.map(c => c.header).join(';'),
            ...rowsToExport.map(row =>
                visibleColumns.map(column => {
                    const value = (row as any)[column.id];
                    return value !== undefined && value !== null ? value.toString().replace(/\n/g, ' ').trim() : '';
                }).join(';')
            )
        ].join('\n');

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `${exportFileName}-${formattedDate}.csv`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },[table])

    return (
        <div className="relative flex flex-col bg-bg-primary w-full rounded-lg border border-border-light/30 h-[calc(100vh-13rem)] overflow-hidden">
            <FilterDialog
                columns={table.getAllColumns()}
                activeFilters={activeFilters}
                isOpen={showFilterDialog}
                onClose={() => setShowFilterDialog(false)}
                onApplyFilter={(filter) => {
                    setActiveFilters(prev => [...prev, filter])
                }}
                onRemoveFilter={(index) => {
                    setActiveFilters(prev => {
                        const filter = prev[index]
                        const column = table.getColumn(filter.column)
                        if (column) {
                            column.setFilterValue(undefined)
                        }
                        return prev.filter((_, i) => i !== index)
                    })
                }}
            />

            <VisibleColumnsDialog
                table={table}
                isOpen={showColumnsDialog}
                onClose={() => setShowColumnsDialog(false)}
            />

            {isLoading && (
                <div className="absolute inset-0 bg-bg-primary/90 z-50 flex items-center justify-center">
                    <Loader size="lg" message="Cargando datos..." />
                </div>
            )}

            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 w-full bg-bg-secondary border-b border-border-light/30">
                <div className="flex space-x-3">
                    {enableExport && (
                        <button
                            onClick={handleExport}
                            className="flex justify-center items-center bg-bg-tertiary text-text-secondary hover:text-selected hover:bg-bg-primary  shadow-lg p-2 rounded-lg w-10 h-10 transition-all duration-200 hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    )}

                    <button
                        onClick={() => setShowColumnsDialog(true)}
                        className="flex justify-center items-center bg-bg-tertiary text-text-secondary hover:text-selected hover:bg-bg-primary shadow-lg p-2 rounded-lg w-10 h-10 transition-all duration-200 hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setShowFilterDialog(true)}
                        className="relative flex justify-center items-center bg-bg-tertiary text-text-secondary hover:text-selected hover:bg-bg-primary shadow-lg p-2 rounded-lg w-10 h-10 transition-all duration-200 hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {activeFilters.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-state-error text-text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1 max-w-md mx-6">
                    <input
                        type="text"
                        className="bg-bg-tertiary border border-border-light text-text-primary p-3 rounded-lg w-full h-10 focus:border-selected focus:outline-none transition-colors duration-200"
                        placeholder="Buscar..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="bg-bg-tertiary border border-border-light text-text-primary p-2 rounded-lg focus:border-selected focus:outline-none"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                    </select>
                    <span className="text-text-secondary text-sm whitespace-nowrap">por página</span>
                </div>
            </header>

            {/* Table Container with Internal Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="text-text-primary font-semibold text-center p-3 border-b border-border-light/20 cursor-pointer hover:bg-bg-tertiary transition-colors duration-200"
                                        onClick={() => {
                                            if (!header.isPlaceholder) {
                                                header.column.toggleSorting();
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>
                                            {!header.isPlaceholder && (
                                                <SortIcon isSorted={header.column.getIsSorted() as string} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {(enableEdit || enableView) && (
                                    <th className="w-32 p-3 text-center text-text-primary font-semibold border-b border-border-light/20">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        ))}
                    </thead>
                    <tbody style={{
                        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
                    }}>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    className={`group transition-colors duration-200 cursor-pointer ${idx % 2 === 0
                                        ? 'bg-bg-primary/30 hover:bg-bg-secondary/60 backdrop-blur-sm'
                                        : 'bg-bg-secondary/30 hover:bg-bg-tertiary/60 backdrop-blur-sm'
                                        }`}
                                    onDoubleClick={() => onDoubleClick?.(row)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="p-3 text-text-primary text-center max-w-[200px] truncate"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    {(enableEdit || enableView) && (
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {enableView && onView && (
                                                    <button
                                                        onClick={() => onView(row)}
                                                        className="p-1 text-state-info hover:text-blue-400 transition-colors duration-200"
                                                        title="Ver"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {enableEdit && onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="p-1 text-state-warning hover:text-yellow-400 transition-colors duration-200"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (enableEdit || enableView ? 1 : 0)} className="p-8 text-center text-text-muted">
                                    No hay resultados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <footer className="flex justify-between items-center px-6 py-4 bg-bg-secondary border-t border-border-light/30">
                <div className="flex items-center gap-2">
                    <label htmlFor="goToPageInput" className="text-text-secondary text-sm">Ir a:</label>
                    <input
                        ref={inputSetPageRef}
                        id="goToPageInput"
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            let pageNumber = e.target.value ? Number(e.target.value) : 0
                            if (pageNumber < 1) pageNumber = 1
                            if (pageNumber > table.getPageCount()) pageNumber = table.getPageCount()
                            table.setPageIndex(pageNumber - 1)
                        }}
                        className="bg-bg-tertiary border border-border-light text-text-primary p-1 rounded w-16 text-center focus:border-selected focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <BackwardButton
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    />
                    <NumberButton
                        number="Primera"
                        active={table.getState().pagination.pageIndex === 0}
                        onClick={() => table.firstPage()}
                    />
                    <NumberButton
                        number="Última"
                        active={table.getState().pagination.pageIndex + 1 === table.getPageCount()}
                        onClick={() => table.lastPage()}
                    />
                    <ForwardButton
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    />
                </div>

                <div className="flex items-center gap-4 text-text-secondary text-sm">
                    <span>
                        Página <strong className="text-text-primary">{table.getState().pagination.pageIndex + 1}</strong> de{' '}
                        <strong className="text-text-primary">{table.getPageCount().toLocaleString()}</strong>
                    </span>
                    <span>
                        Total: <strong className="text-text-primary">{table.getRowCount()}</strong> registros
                    </span>
                </div>
            </footer>
        </div>
    )
}
