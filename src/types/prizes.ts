import type { RaffleId } from './raffles';

export type PrizeId = string;

export interface Prize {
  id: PrizeId;
  raffleId: RaffleId;
  imageUrl: string;
  title: string;
  shortDescription: string;
  winningTicket: number;
  isMainPrize?: boolean;
}

export interface IPrizesService {
  getPrizeByRaffleIdAndTicketId(
    raffleId: RaffleId, 
    ticketId: number, 
    signal?: AbortSignal
  ): Promise<Prize | null>;
  
}

