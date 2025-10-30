import type { Bank } from '../types/payments';

export async function getBanks(_signal?: AbortSignal): Promise<Bank[]> {
  // Simulación de latencia y lista de bancos comunes en VE
  await new Promise(r => setTimeout(r, 250));
  return [
    { code: '0102', name: 'Banco de Venezuela' },
    { code: '0104', name: 'Venezolano de Crédito' },
    { code: '0105', name: 'Mercantil' },
    { code: '0108', name: 'Provincial' },
    { code: '0114', name: 'Bancaribe' },
    { code: '0115', name: 'Exterior' },
    { code: '0128', name: 'Banco Caroní' },
    { code: '0134', name: 'Banesco' },
    { code: '0137', name: 'Sofitasa' },
    { code: '0138', name: 'Banco Plaza' },
    { code: '0151', name: 'BFC' },
    { code: '0172', name: 'Bancamiga' },
    { code: '0174', name: 'Banplus' },
    { code: '0175', name: '100% Banco' },
    { code: '0191', name: 'Banco Nacional de Crédito' },
  ];
}


