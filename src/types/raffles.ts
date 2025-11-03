export type RaffleId = string;

export interface RaffleSummary {
  id: RaffleId;
  title: string;
  shortDescription: string;
  coverImageUrl: string;
  price: number;              // precio por ticket
  currency: 'VES' | 'USD';
  initialTicket: number;
  ticketsTotal: number;
  totalSold: number;
  endsAt: string;             // ISO
  highlight?: boolean;
  isMain?: boolean;
}

export interface RaffleDetail extends RaffleSummary {
  gallery?: string[];
  terms?: string;
  tickets?: RaffleTicket[];
}

export type RaffleTicketStatus = 'available' | 'sold' | 'reserved';

export interface RaffleTicket {
  raffleId: RaffleId;
  number: number;
  status: RaffleTicketStatus;
}

export interface IRafflesService {
  getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]>;
  getRaffleDetail(id: RaffleId, signal?: AbortSignal): Promise<RaffleSummary>;
  getSoldTickets(raffleId: RaffleId, signal?: AbortSignal): Promise<number[]>;
}


