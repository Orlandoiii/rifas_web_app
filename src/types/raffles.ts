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
  isMainPrize?: boolean;
  isBlessNumber?: boolean;
}

export interface RaffleParticipant {
  participantId?: RaffleId;  // Opcional: se incluye si ya existe
  raffleId: RaffleId;
  id: string;  // Cédula de identidad
  name: string;
  email: string;
  phone: string;
  ticketNumber: number[];
}

export interface RaffleParticipantResponse {
  reserveTickets: number[];
  bookingId: string;
}

export interface RaffleVerifyRequest {
  raffleId: RaffleId;
  documentId: string;
}

export interface RaffleVerifyTicket {
  ticketNumber: number;
  isMainPrize?: boolean;
  isBlessNumber?: boolean;
}

export interface RaffleVerifyResult {
  raffleId: RaffleId;
  documentId: string;
  boughtTickets: RaffleVerifyTicket[];
  
}


export interface IRafflesService {
  getRaffles(signal?: AbortSignal): Promise<RaffleSummary[]>;
  getSoldTickets(raffleId: RaffleId, signal?: AbortSignal): Promise<number[]>;
  createParticipant(participant: RaffleParticipant, signal?: AbortSignal): Promise<RaffleParticipantResponse>;
  verifyRaffle(request: RaffleVerifyRequest, signal?: AbortSignal): Promise<RaffleVerifyResult>;
  getMainWinnerTickets(raffleId: RaffleId, signal?: AbortSignal): Promise<number[]>;
  getBlessNumberWinnerTickets(raffleId: RaffleId, signal?: AbortSignal): Promise<number[]>;
}


