import type { IRafflesService, RaffleSummary, RaffleParticipant, RaffleParticipantResponse, RaffleVerifyRequest, RaffleVerifyResult } from '../types/raffles';
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
    participant: RaffleParticipant,
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
  },

  async verifyRaffle(
    request: RaffleVerifyRequest,
    signal?: AbortSignal
  ): Promise<RaffleVerifyResult> {
    const response = await fetch(API_ENDPOINTS.raffles.verify(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  }
};


