import type { Bank } from '../types/payments';
import { API_ENDPOINTS } from '../config/api';

export async function getBanks(signal?: AbortSignal): Promise<Bank[]> {
  const response = await fetch(API_ENDPOINTS.payments.banks(), { signal });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}


