import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rafflesService } from '../services/raffles';
import type { RaffleSummary, RaffleDetail, RaffleParticipant } from '../types/raffles';
import { buildRaffleDetail } from '../utils/raffleTickets';

export const QUERY_KEYS = {
  raffles: {
    all: ['raffles'] as const,
    list: () => [...QUERY_KEYS.raffles.all, 'list'] as const,
    soldTickets: (id: string) => [...QUERY_KEYS.raffles.all, 'soldTickets', id] as const,
    participants: () => [...QUERY_KEYS.raffles.all, 'participants'] as const,
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
 * Toma la rifa de la lista cacheada y obtiene los tickets vendidos
 * Solo genera tickets si la petición fue exitosa (200)
 */
export function useRaffleDetail(raffle: RaffleSummary | null) {
  const soldTicketsQuery = useSoldTickets(raffle?.id || null);

  // Combinar los datos para crear el RaffleDetail completo
  // Solo si NO hay error y tenemos data (incluso si es un array vacío)
  const detail: RaffleDetail | undefined = 
    raffle && !soldTicketsQuery.isError && soldTicketsQuery.data !== undefined
      ? buildRaffleDetail(raffle, soldTicketsQuery.data)
      : undefined;

  return {
    data: detail,
    isLoading: soldTicketsQuery.isLoading,
    isError: soldTicketsQuery.isError,
    error: soldTicketsQuery.error,
  };
}

/**
 * Hook para crear un participante en una rifa (reservar tickets)
 * Invalida automáticamente la cache de tickets vendidos para reflejar los cambios
 */
export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participant: Omit<RaffleParticipant, 'participantId'>) =>
      rafflesService.createParticipant(participant),
    onSuccess: (_data, variables) => {
      // Invalidar la cache de tickets vendidos para esta rifa
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.raffles.soldTickets(variables.raffleId),
      });
      // También invalidar la lista de rifas para actualizar el totalSold
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.raffles.list(),
      });
    },
  });
}

