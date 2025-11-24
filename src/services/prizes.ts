import type { IPrizesService, Prize } from '../types/prizes';
import { API_ENDPOINTS } from '../config/api';
import type { RaffleId } from '../types/raffles';
import { logger } from './logger';

export const prizesService: IPrizesService = {
  async getPrizeByRaffleIdAndTicketId(
    raffleId: RaffleId,
    ticketId: number,
    documentId: string,
    signal?: AbortSignal
  ): Promise<Prize | null> {
    const url = API_ENDPOINTS.prizes.byRaffleAndTicket(raffleId, ticketId, documentId);
    const queryParams = { raffleId, ticketId, documentId };
    
    logger.request('GET', url, queryParams, { service: 'Prizes' });
    
    const response = await fetch(url, { signal });
    const data = await response.json();
    
    logger.response('GET', url, response.status, data, { service: 'Prizes' });
    
    if (!response.ok) {
      
      if (response.status === 404) {
        logger.info('No se encontró premio bless (404) para ticket', { ticketId, raffleId }, { service: 'Prizes' });
        return null; // No hay premio para este ticket
      }

      if(response.status === 400) {
        logger.info('Error al obtener premio bless (400) para ticket', { ticketId, raffleId }, { service: 'Prizes' });
        return null; // No hay premio para este ticket
      }
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      logger.error('Error al obtener premio bless', { errorMessage, data }, { service: 'Prizes' });
      throw new Error(errorMessage || `Error al obtener el premio. Código: ${response.status}`);
    }
    
    return data;
  }
};

