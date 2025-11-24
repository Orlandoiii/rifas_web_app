import type { IRafflesService, RaffleSummary, RaffleParticipant, RaffleParticipantResponse, RaffleVerifyRequest, RaffleVerifyResult } from '../types/raffles';
import { API_ENDPOINTS } from '../config/api';
import { logger } from './logger';

export const rafflesService: IRafflesService = {
  async getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]> {
    const url = API_ENDPOINTS.raffles.list();
    logger.request('GET', url, undefined, { service: 'Raffles' });
    
    const response = await fetch(url, { signal });
    const data = await response.json();
    
    logger.response('GET', url, response.status, data, { service: 'Raffles' });
    
    if (!response.ok) {
      logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Raffles' });
      throw new Error(`Error al obtener las rifas. Código: ${response.status}`);
    }
    
    return data;
  },

  async getSoldTickets(raffleId: string, signal?: AbortSignal): Promise<number[]> {
    const url = API_ENDPOINTS.raffles.soldTickets(raffleId);
    logger.request('GET', url, undefined, { service: 'Raffles' });
    
    const response = await fetch(url, { signal });
    const data = await response.json();
    
    logger.response('GET', url, response.status, data, { service: 'Raffles' });
    
    if (!response.ok) {
      logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Raffles' });
      throw new Error(`Error al obtener los tickets vendidos. Código: ${response.status}`);
    }
    
    return data;
  },

  async createParticipant(
    participant: RaffleParticipant,
    signal?: AbortSignal
  ): Promise<RaffleParticipantResponse> {
    const url = API_ENDPOINTS.raffles.createParticipant();
    const requestBody = participant;
    
    logger.request('POST', url, requestBody, { service: 'Raffles' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participant),
      signal,
    });

    const data = await response.json();
    logger.response('POST', url, response.status, data, { service: 'Raffles' });

    if (!response.ok) {
      logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Raffles' });
      throw new Error(`Error al crear el participante. Código: ${response.status}`);
    }

    return data;
  },

  async verifyRaffle(
    request: RaffleVerifyRequest,
    signal?: AbortSignal
  ): Promise<RaffleVerifyResult> {
    const url = API_ENDPOINTS.raffles.verify();
    const requestBody = request;
    
    logger.request('POST', url, requestBody, { service: 'Raffles' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    const data = await response.json();
    logger.response('POST', url, response.status, data, { service: 'Raffles' });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      logger.error(errorMessage, data, { service: 'Raffles' });
      throw new Error(errorMessage || `Error al procesar la solicitud. Código: ${response.status}`);
    }

    return data;
  },

  async getMainWinnerTickets(raffleId: string, signal?: AbortSignal): Promise<number[]> {
    const url = API_ENDPOINTS.raffles.mainWinners(raffleId);
    logger.request('GET', url, undefined, { service: 'Raffles' });
    
    const response = await fetch(url, { signal });
    const data = await response.json();
    
    logger.response('GET', url, response.status, data, { service: 'Raffles' });
    
    if (!response.ok) {
      logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Raffles' });
      throw new Error(`Error al obtener los números ganadores principales. Código: ${response.status}`);
    }
    
    return data;
  },

  async getBlessNumberWinnerTickets(raffleId: string, signal?: AbortSignal): Promise<number[]> {
    const url = API_ENDPOINTS.raffles.blessWinners(raffleId);
    logger.request('GET', url, undefined, { service: 'Raffles' });
    
    const response = await fetch(url, { signal });
    const data = await response.json();
    
    logger.response('GET', url, response.status, data, { service: 'Raffles' });
    
    if (!response.ok) {
      logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Raffles' });
      throw new Error(`Error al obtener los números ganadores bless. Código: ${response.status}`);
    }
    
    return data;
  }
};


