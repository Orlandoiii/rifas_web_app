import type { IRafflesService, CurrentRaffle, RaffleSummary } from '../types/raffles';
import { mockCurrentRaffle, mockRaffles } from '../mocks/raffles';

export const rafflesService: IRafflesService = {
  async getCurrentRaffle(_signal?: AbortSignal): Promise<CurrentRaffle | null> {
    // Simulación de latencia
    await new Promise(r => setTimeout(r, 300));
    return mockCurrentRaffle;
  },

  async getRaffles(_signal?: AbortSignal): Promise<RaffleSummary[]> {
    await new Promise(r => setTimeout(r, 300));
    return mockRaffles;
  }
};


