export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.120.149:8080/api/v1';

export const API_ENDPOINTS = {
  raffles: {
    list: () => `${API_BASE_URL}/raffles`,
    soldTickets: (id: string) => `${API_BASE_URL}/raffles/${id}/tickets/sold`,
    createParticipant: () => `${API_BASE_URL}/raffles/participant`,
    verify: () => `${API_BASE_URL}/raffles/verify`,
    mainWinners: (id: string) => `${API_BASE_URL}/raffles/${id}/winners/main`,
    blessWinners: (id: string) => `${API_BASE_URL}/raffles/${id}/winners/bless`,
  },
  prizes: {
    byRaffleAndTicket: (raffleId: string, ticketId: number, documentId: string) => 
      `${API_BASE_URL}/raffles/${raffleId}/prizes/${ticketId}?documentId=${encodeURIComponent(documentId)}`,
  },
  payments: {
    banks: () => `${API_BASE_URL}/sypago/banks`,
    requestOtp: () => `${API_BASE_URL}/sypago/debit/request-otp`,
    processDebit: () => `${API_BASE_URL}/sypago/debit/transaction-otp`,
    transactionStatus: (transactionId: string, bookingId: string) => 
      `${API_BASE_URL}/sypago/debit/transaction/status?transaction_id=${transactionId}&booking_id=${bookingId}`,
  },
} as const;

