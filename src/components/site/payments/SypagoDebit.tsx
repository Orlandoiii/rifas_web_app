import * as React from 'react';
import { Button } from '../../lib/components/button';
import { Input } from '../../lib/components/input';
import { Select } from '../../lib/components/select';
import { useBanks } from '../../../hooks';

export type SypagoDebitPayload = {
  bankCode: string;
  mode: 'phone' | 'account';
  phone?: string;
  account?: string;
  docType: 'V' | 'E' | 'J' | 'P';
  docNumber: string;
};

interface SypagoDebitProps {
  raffleTitle: string;
  selectedNumbers: number[];
  price: number;
  currency: string;
  payload: SypagoDebitPayload;
  onChange: (payload: SypagoDebitPayload) => void;
  disabled?: boolean;
}

export default function SypagoDebit({ raffleTitle, selectedNumbers, price, currency, payload, onChange, disabled = false }: SypagoDebitProps) {
  const { data: banks = [], isLoading: loadingBanks, isError: errorBanks } = useBanks();

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);
  const bankOptions = React.useMemo(() => banks.map(b => ({ value: b.code, label: `${b.code} - ${b.name}` })), [banks]);
  const docTypeOptions = React.useMemo(() => [
    { value: 'V', label: 'V - Venezolano' },
    { value: 'E', label: 'E - Extranjero' },
    { value: 'J', label: 'J - Jurídico' },
    { value: 'P', label: 'P - Pasaporte' }
  ], []);

  const isFormDisabled = disabled || loadingBanks || errorBanks;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="bg-bg-tertiary/40 border border-border-light rounded-lg p-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-text-primary font-semibold truncate">{raffleTitle}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-text-secondary">Tickets: <span className="text-text-primary font-semibold">{selectedNumbers.length}</span></span>
            <span className="text-text-secondary">Total: <span className="text-selected font-semibold">{total.toFixed(2)} {currency}</span></span>
          </div>
        </div>
        {!!selectedNumbers.length && (
          <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-auto">
            {selectedNumbers.slice().sort((a, b) => a - b).map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded-md bg-bg-secondary border border-border-light text-text-primary">#{n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Formulario Sypago Debit */}
      <div className="space-y-3">
        {errorBanks && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            Error al cargar los bancos. Por favor, intenta nuevamente.
          </div>
        )}
        
        <Select
          label="Banco"
          options={bankOptions}
          placeholder={loadingBanks ? "Cargando bancos..." : "Seleccione el banco"}
          value={payload.bankCode}
          onValueChange={(value) => onChange({ ...payload, bankCode: value })}
          disabled={isFormDisabled}
        />

        <div className="flex items-center gap-2">
          <Button 
            variant={payload.mode === 'phone' ? 'secondary' : 'ghost'} 
            onClick={() => onChange({ ...payload, mode: 'phone' })}
            disabled={isFormDisabled}
          >
            Teléfono
          </Button>
          <Button 
            variant={payload.mode === 'account' ? 'secondary' : 'ghost'} 
            onClick={() => onChange({ ...payload, mode: 'account' })}
            disabled={isFormDisabled}
          >
            Cuenta
          </Button>
        </div>

        {payload.mode === 'phone' ? (
          <Input
            label="Teléfono"
            placeholder="04121234567"
            value={payload.phone}
            onChange={(e) => onChange({ ...payload, phone: e.target.value })}
            disabled={isFormDisabled}
          />
        ) : (
          <Input
            label="Cuenta"
            placeholder="XXXXXXXXXXXXXX"
            value={payload.account}
            onChange={(e) => onChange({ ...payload, account: e.target.value })}
            disabled={isFormDisabled}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Documento"
            options={docTypeOptions}
            value={payload.docType}
            onValueChange={(value) => onChange({ ...payload, docType: value as any })}
            disabled={isFormDisabled}
          />
          <div className="md:col-span-2">
            <Input
              label="Número de Documento"
              placeholder="12345678"
              value={payload.docNumber}
              onChange={(e) => onChange({ ...payload, docNumber: e.target.value })}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


