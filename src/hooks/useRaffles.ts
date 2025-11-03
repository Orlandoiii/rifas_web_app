import { useQuery } from '@tanstack/react-query';
import { rafflesService } from '../services/raffles';
import type { RaffleSummary } from '../types/raffles';

export const QUERY_KEYS = {
  raffles: {
    all: ['raffles'] as const,
    list: () => [...QUERY_KEYS.raffles.all, 'list'] as const,
    detail: (id: string) => [...QUERY_KEYS.raffles.all, 'detail', id] as const,
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
 * Hook para obtener el detalle de una rifa específica
 */
export function useRaffleDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.raffles.detail(id || ''),
    queryFn: ({ signal }) => rafflesService.getRaffleDetail(id!, signal),
    enabled: !!id, // Solo ejecuta si hay un ID
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

