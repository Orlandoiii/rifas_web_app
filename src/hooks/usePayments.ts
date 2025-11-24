import { useQuery } from '@tanstack/react-query';
import { getBanks, getSypagoRejectCodes } from '../services/payments';

export const PAYMENT_QUERY_KEYS = {
  payments: {
    all: ['payments'] as const,
    banks: () => [...PAYMENT_QUERY_KEYS.payments.all, 'banks'] as const,
    rejectCodes: () => [...PAYMENT_QUERY_KEYS.payments.all, 'rejectCodes'] as const,
  },
};

/**
 * Hook para obtener la lista de bancos
 */
export function useBanks() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.payments.banks(),
    queryFn: ({ signal }) => getBanks(signal),
    staleTime: 1000 * 60 * 30, // 30 minutos (los bancos no cambian frecuentemente)
  });
}

/**
 * Hook para obtener los códigos de rechazo de SyPago
 */
export function useSypagoRejectCodes() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.payments.rejectCodes(),
    queryFn: ({ signal }) => getSypagoRejectCodes(signal),
    staleTime: 1000 * 60 * 60, // 1 hora (los códigos de rechazo no cambian frecuentemente)
  });
}

