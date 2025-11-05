export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.105:8080/api/v1';

export const API_ENDPOINTS = {
  raffles: {
    list: () => `${API_BASE_URL}/raffles`,
    soldTickets: (id: string) => `${API_BASE_URL}/raffles/${id}/tickets/sold`,
    createParticipant: () => `${API_BASE_URL}/raffles/participant`,
  },
  payments: {
    banks: () => `${API_BASE_URL}/sypago/banks`,
  },
} as const;

