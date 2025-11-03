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

  endsAt: string;             // ISO
  highlight?: boolean;
  isMain?: boolean;
}

export interface RaffleDetail extends RaffleSummary {
  gallery?: string[];
  terms?: string;
  numbers?: RaffleNumber[];
}

export type RaffleNumberStatus = 'available' | 'sold' | 'reserved';
export interface RaffleNumber {
  raffleId: RaffleId;
  number: number;
  status: RaffleNumberStatus;
}

export interface IRafflesService {
  getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]>;
  getRaffleDetail(id: RaffleId, signal?: AbortSignal): Promise<RaffleDetail>;
}


