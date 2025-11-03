import type { IRafflesService, RaffleSummary, RaffleDetail, RaffleNumber } from '../types/raffles';
import { mockCurrentRaffle, mockRaffles } from '../mocks/raffles';

export const rafflesService: IRafflesService = {
  async getCurrentRaffle(_signal?: AbortSignal): Promise<RaffleSummary | null> {
    // Simulación de latencia
    await new Promise(r => setTimeout(r, 300));
    return mockCurrentRaffle;
  },

  async getRaffles(_signal?: AbortSignal): Promise<RaffleSummary[]> {
    await new Promise(r => setTimeout(r, 300));
    return mockRaffles;
  },

  async getRaffleDetail(id: string, _signal?: AbortSignal): Promise<RaffleDetail> {
    await new Promise(r => setTimeout(r, 300));
    const base = mockRaffles.find(r => r.id === id) || mockCurrentRaffle;
    const numbers: RaffleNumber[] = Array.from({ length: 12000 }, (_, i) => {
      const n = i + 1;
      const rand = Math.random();
      const status = rand < 0.15 ? 'sold' : rand < 0.2 ? 'reserved' : 'available';
      return { number: n, status };
    });
    return {
      ...(base as RaffleDetail),
      numbers
    };
  }
};


