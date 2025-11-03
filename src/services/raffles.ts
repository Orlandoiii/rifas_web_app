import type { IRafflesService, RaffleSummary } from '../types/raffles';
import { API_ENDPOINTS } from '../config/api';

export const rafflesService: IRafflesService = {
  async getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]> {
    try {
      const response = await fetch(API_ENDPOINTS.raffles.list(), { signal });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching raffles:', error);
      return [];
    }
  },

  async getRaffleDetail(id: string, signal?: AbortSignal): Promise<RaffleSummary> {
    const response = await fetch(API_ENDPOINTS.raffles.detail(id), { signal });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },

  async getSoldTickets(raffleId: string, signal?: AbortSignal): Promise<number[]> {
    try {
      const response = await fetch(API_ENDPOINTS.raffles.soldTickets(raffleId), { signal });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching sold tickets:', error);
      return [];
    }
  }
};


