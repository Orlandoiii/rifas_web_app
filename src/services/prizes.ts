import type { IPrizesService, Prize } from '../types/prizes';
import { API_ENDPOINTS } from '../config/api';
import type { RaffleId } from '../types/raffles';

export const prizesService: IPrizesService = {
  async getPrizeByRaffleIdAndTicketId(
    raffleId: RaffleId,
    ticketId: number,
    documentId: string,
    signal?: AbortSignal
  ): Promise<Prize | null> {
    const url = API_ENDPOINTS.prizes.byRaffleAndTicket(raffleId, ticketId, documentId);
    console.log('Buscando premio bless en:', url);
    
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('No se encontró premio bless (404) para ticket:', ticketId);
        return null; // No hay premio para este ticket
      }
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      console.error('Error al obtener premio bless:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const prize = await response.json();
    console.log('Premio bless recibido del backend:', prize);
    return prize;
  }
};

