import type { RaffleTicket, RaffleSummary, RaffleDetail, RaffleTicketStatus } from '../types/raffles';

/**
 * Genera todos los tickets de una rifa basándose en initialTicket y ticketsTotal
 * y marca como vendidos los números que están en la lista de soldNumbers
 */
export function generateRaffleTickets(
  raffle: RaffleSummary,
  soldNumbers: number[] = []
): RaffleTicket[] {
  const tickets: RaffleTicket[] = [];
  const soldSet = new Set(soldNumbers);
  
  for (let i = 0; i < raffle.ticketsTotal; i++) {
    const ticketNumber = raffle.initialTicket + i;
    const status: RaffleTicketStatus = soldSet.has(ticketNumber) ? 'sold' : 'available';
    
    tickets.push({
      raffleId: raffle.id,
      number: ticketNumber,
      status,
    });
  }
  
  return tickets;
}

/**
 * Combina la información de la rifa con sus tickets para crear un RaffleDetail completo
 */
export function buildRaffleDetail(
  raffle: RaffleSummary,
  soldNumbers: number[] = []
): RaffleDetail {
  return {
    ...raffle,
    tickets: generateRaffleTickets(raffle, soldNumbers),
  };
}

/**
 * Calcula el número de tickets vendidos basándose en la lista de números vendidos
 */
export function getTicketsSold(soldNumbers: number[]): number {
  return soldNumbers.length;
}

