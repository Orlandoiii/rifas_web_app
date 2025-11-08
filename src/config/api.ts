export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.31.135:8080/api/v1';

export const API_ENDPOINTS = {
  raffles: {
    list: () => `${API_BASE_URL}/raffles`,
    soldTickets: (id: string) => `${API_BASE_URL}/raffles/${id}/tickets/sold`,
    createParticipant: () => `${API_BASE_URL}/raffles/participant`,
    verify: () => `${API_BASE_URL}/raffles/verify`,
  },
  payments: {
    banks: () => `${API_BASE_URL}/sypago/banks`,
    requestOtp: () => `${API_BASE_URL}/sypago/debit/request-otp`,
    processDebit: () => `${API_BASE_URL}/sypago/debit/transaction-otp`,
    transactionStatus: (transactionId: string, bookingId: string) => 
      `${API_BASE_URL}/sypago/debit/transaction/status?transaction_id=${transactionId}&booking_id=${bookingId}`,
  },
} as const;

