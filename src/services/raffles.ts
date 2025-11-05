import type { IRafflesService, RaffleSummary, RaffleParticipant, RaffleParticipantResponse } from '../types/raffles';
import { API_ENDPOINTS } from '../config/api';

export const rafflesService: IRafflesService = {
  async getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]> {
    const response = await fetch(API_ENDPOINTS.raffles.list(), { signal });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },

  async getSoldTickets(raffleId: string, signal?: AbortSignal): Promise<number[]> {
    const response = await fetch(API_ENDPOINTS.raffles.soldTickets(raffleId), { signal });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },

  async createParticipant(
    participant: Omit<RaffleParticipant, 'participantId'>,
    signal?: AbortSignal
  ): Promise<RaffleParticipantResponse> {
    const response = await fetch(API_ENDPOINTS.raffles.createParticipant(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participant),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
};


