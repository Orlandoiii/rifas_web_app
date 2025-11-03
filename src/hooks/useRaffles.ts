import { useQuery } from '@tanstack/react-query';
import { rafflesService } from '../services/raffles';
import type { RaffleSummary, RaffleDetail } from '../types/raffles';
import { buildRaffleDetail } from '../utils/raffleTickets';

export const QUERY_KEYS = {
  raffles: {
    all: ['raffles'] as const,
    list: () => [...QUERY_KEYS.raffles.all, 'list'] as const,
    detail: (id: string) => [...QUERY_KEYS.raffles.all, 'detail', id] as const,
    soldTickets: (id: string) => [...QUERY_KEYS.raffles.all, 'soldTickets', id] as const,
  },
};

/**
 * Hook para obtener todas las rifas disponibles
 */
export function useRaffles() {
  return useQuery({
    queryKey: QUERY_KEYS.raffles.list(),
    queryFn: ({ signal }) => rafflesService.getRaffles(signal),
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Función helper para obtener la rifa principal de una lista
 * Busca la rifa con isMain=true, si no existe retorna la primera de la lista
 */
export function getMainRaffle(raffles: RaffleSummary[]): RaffleSummary | null {
  if (!raffles || raffles.length === 0) return null;
  const main = raffles.find(r => r.isMain === true);
  return main || raffles[0];
}

/**
 * Hook para obtener los tickets vendidos de una rifa
 */
export function useSoldTickets(raffleId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.raffles.soldTickets(raffleId || ''),
    queryFn: ({ signal }) => rafflesService.getSoldTickets(raffleId!, signal),
    enabled: !!raffleId,
    staleTime: 1000 * 60 * 2, // 2 minutos (más corto porque cambia frecuentemente)
  });
}

/**
 * Hook para obtener el detalle completo de una rifa con sus tickets
 * Combina la información de la rifa con los tickets vendidos
 */
export function useRaffleDetail(id: string | null) {
  const raffleQuery = useQuery({
    queryKey: QUERY_KEYS.raffles.detail(id || ''),
    queryFn: ({ signal }) => rafflesService.getRaffleDetail(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const soldTicketsQuery = useSoldTickets(id);

  // Combinar los datos para crear el RaffleDetail completo
  const detail: RaffleDetail | undefined = 
    raffleQuery.data && soldTicketsQuery.data
      ? buildRaffleDetail(raffleQuery.data, soldTicketsQuery.data)
      : undefined;

  return {
    data: detail,
    isLoading: raffleQuery.isLoading || soldTicketsQuery.isLoading,
    isError: raffleQuery.isError || soldTicketsQuery.isError,
    error: raffleQuery.error || soldTicketsQuery.error,
  };
}

