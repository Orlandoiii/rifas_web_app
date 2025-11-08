import type { RaffleSummary } from '../types/raffles';

/**
 * Verifica si una rifa está culminada comparando endsAt con la fecha actual
 */
export function isRaffleFinished(raffle: RaffleSummary): boolean {
  if (!raffle.endsAt) return false;
  const endDate = new Date(raffle.endsAt).getTime();
  const now = Date.now();
  return now >= endDate;
}

