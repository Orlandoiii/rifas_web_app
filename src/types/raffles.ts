export type RaffleId = string;

export interface RaffleSummary {
  id: RaffleId;
  title: string;
  shortDescription: string;
  coverImageUrl: string;
  price: number;              // precio por ticket
  currency: 'VES' | 'USD';
  ticketsTotal: number;
  ticketsSold: number;
  endsAt: string;             // ISO
  highlight?: boolean;
}

export interface RaffleDetail extends RaffleSummary {
  gallery?: string[];
  terms?: string;
  numbers?: RaffleNumber[];
}

export interface CurrentRaffle extends RaffleSummary {}

export type RaffleNumberStatus = 'available' | 'sold' | 'reserved';
export interface RaffleNumber {
  number: number;
  status: RaffleNumberStatus;
}

export interface IRafflesService {
  getCurrentRaffle(signal?: AbortSignal): Promise<CurrentRaffle | null>;
  getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]>;
  getRaffleDetail(id: RaffleId, signal?: AbortSignal): Promise<RaffleDetail>;
}


