import * as React from 'react';
import { Input } from '../lib/components/input';

type Buyer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

interface UserDataFormProps {
  raffleTitle: string;
  price: number;
  currency: string;
  selectedNumbers: number[];
  buyer: Buyer;
  onChange: (buyer: Buyer) => void;
  disabled?: boolean;
}

export default function UserDataForm({ raffleTitle, price, currency,
  selectedNumbers, buyer, onChange, disabled = false }: UserDataFormProps) {

  const total = React.useMemo(() => (price || 0) * (selectedNumbers?.length || 0), [price, selectedNumbers]);

  const handleField = (key: keyof Buyer) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...buyer, [key]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-tertiary/40 border border-border-light rounded-lg p-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-text-primary font-semibold truncate">{raffleTitle}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-text-secondary">Tickets:
              <span className="text-text-primary font-semibold">{selectedNumbers.length}</span>
            </span>
            <span className="text-text-secondary">Total:
              <span className="text-selected font-semibold">{total.toFixed(2)} {currency}</span>
            </span>
          </div>
        </div>
        {selectedNumbers?.length ? (
          <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-auto">
            {selectedNumbers.slice().sort((a, b) => a - b).map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded-md bg-bg-secondary 
              border border-border-light text-text-primary">#{n}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-text-secondary text-sm mb-1">Cédula</div>
          <Input
            placeholder="12345678"
            value={buyer.id}
            onChange={handleField('id')}
            disabled={disabled}
          />
        </div>
        <div>
          <div className="text-text-secondary text-sm mb-1">Nombre y Apellido</div>
          <Input
            placeholder="Juan Pérez"
            value={buyer.name}
            onChange={handleField('name')}
            disabled={disabled}
          />
        </div>
        <div>
          <div className="text-text-secondary text-sm mb-1">Teléfono</div>
          <Input
            placeholder="04121234567"
            value={buyer.phone}
            onChange={handleField('phone')}
            disabled={disabled}
          />
        </div>
        <div>
          <div className="text-text-secondary text-sm mb-1">Correo</div>
          <Input
            type="email"
            placeholder="correo@dominio.com"
            value={buyer.email}
            onChange={handleField('email')}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}


