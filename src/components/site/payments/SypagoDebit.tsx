import * as React from 'react';
import { Button } from '../../lib/components/button';
import { Input } from '../../lib/components/input';
import { Select } from '../../lib/components/select';
import type { Bank } from '../../../types/payments';
import { getBanks } from '../../../services/payments';

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
  onSubmit: (payload: SypagoDebitPayload) => void;
}

export default function SypagoDebit({ raffleTitle, selectedNumbers, price, currency, onSubmit }: SypagoDebitProps) {
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [payload, setPayload] = React.useState<SypagoDebitPayload>({
    bankCode: '',
    mode: 'phone',
    phone: '',
    account: '',
    docType: 'V',
    docNumber: ''
  });

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);

  React.useEffect(() => {
    getBanks().then(setBanks);
  }, []);

  const bankOptions = React.useMemo(() => banks.map(b => ({ value: b.code, label: `${b.code} - ${b.name}` })), [banks]);

  const canPay = React.useMemo(() => {
    if (!payload.bankCode) return false;
    if (payload.mode === 'phone' && !payload.phone) return false;
    if (payload.mode === 'account' && !payload.account) return false;
    if (!payload.docNumber) return false;
    return true;
  }, [payload]);

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
            {selectedNumbers.slice().sort((a,b)=>a-b).map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded-md bg-bg-secondary border border-border-light text-text-primary">#{n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Formulario Sypago Debit */}
      <div className="space-y-3">
        <Select
          label="Banco"
          options={bankOptions}
          placeholder="Seleccione el banco"
          value={payload.bankCode}
          onValueChange={(value) => setPayload(p => ({ ...p, bankCode: value }))}
        />

        <div className="flex items-center gap-2">
          <Button variant={payload.mode === 'phone' ? 'secondary' : 'ghost'} onClick={() => setPayload(p => ({ ...p, mode: 'phone' }))}>Teléfono</Button>
          <Button variant={payload.mode === 'account' ? 'secondary' : 'ghost'} onClick={() => setPayload(p => ({ ...p, mode: 'account' }))}>Cuenta</Button>
        </div>

        {payload.mode === 'phone' ? (
          <Input
            label="Teléfono"
            placeholder="04121234567"
            value={payload.phone}
            onChange={(e) => setPayload(p => ({ ...p, phone: e.target.value }))}
          />
        ) : (
          <Input
            label="Cuenta"
            placeholder="XXXXXXXXXXXXXX"
            value={payload.account}
            onChange={(e) => setPayload(p => ({ ...p, account: e.target.value }))}
          />
        )}

        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-text-secondary text-sm mb-1">Doc</div>
            <select
              className="bg-bg-secondary border border-border-light rounded-md px-3 py-2 text-sm text-text-primary w-full focus:border-selected focus:outline-none"
              value={payload.docType}
              onChange={(e) => setPayload(p => ({ ...p, docType: e.target.value as any }))}
            >
              <option value="V">V</option>
              <option value="E">E</option>
              <option value="J">J</option>
              <option value="P">P</option>
            </select>
          </div>
          <div className="col-span-2">
            <Input
              label="Número de Documento"
              placeholder="12345678"
              value={payload.docNumber}
              onChange={(e) => setPayload(p => ({ ...p, docNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full" disabled={!canPay} onClick={() => onSubmit(payload)}>Pagar</Button>
        </div>
      </div>
    </div>
  );
}


