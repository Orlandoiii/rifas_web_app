import type { Bank, RejectCode } from '../types/payments';
import { API_ENDPOINTS } from '../config/api';
import { logger } from './logger';

export async function getBanks(signal?: AbortSignal): Promise<Bank[]> {
  const url = API_ENDPOINTS.payments.banks();
  logger.request('GET', url, undefined, { service: 'Payments' });
  
  const response = await fetch(url, { signal });
  const data = await response.json();
  
  logger.response('GET', url, response.status, data, { service: 'Payments' });
  
  if (!response.ok) {
    logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Payments' });
    throw new Error(`Error al obtener la lista de bancos. Código: ${response.status}`);
  }
  
  return data;
}

export async function getSypagoRejectCodes(signal?: AbortSignal): Promise<RejectCode[]> {
  const url = API_ENDPOINTS.payments.rejectCodes();
  logger.request('GET', url, undefined, { service: 'Payments' });
  
  const response = await fetch(url, { signal });
  const data = await response.json();
  
  logger.response('GET', url, response.status, data, { service: 'Payments' });
  
  if (!response.ok) {
    logger.error(`Error ${response.status}: ${response.statusText}`, data, { service: 'Payments' });
    throw new Error(`Error al obtener los códigos de rechazo. Código: ${response.status}`);
  }
  
  return data;
}

export interface RequestOtpPayload {
  booking_id: string;         // ID de la reserva
  document_letter: string;    // "V", "E", "J", "P"
  document: string;           // "26951697"
  bank_code: string;          // "0105"
  account_number: string;     // "04242186302"
  amount: number;             // 5.0
  currency: string;           // "VES", "USD"
}

export interface ProcessDebitPayload {
  // Datos de la rifa y participante
  booking_id: string;
  participant_id: string;
  raffle_id: string;
  tickets: number[];
  
  // Datos del usuario receptor
  receiver_name: string;
  receiver_otp: string;
  receiver_document_type: string;
  receiver_document_number: string;
  receiver_bank_code: string;
  receiver_account_number: string;
  
  // Datos del monto
  amount: number;
  currency: string;
}

export interface ProcessDebitResponse {
  transaction_id: string;
  booking_id?: string;  // Opcional, puede no venir en la respuesta
}

export type TransactionStatus = 'ACCP' | 'RJCT' | 'TIMEOUT';

export interface TransactionStatusResponse {
  transaction_id: string;
  booking_id: string;
  ref_ibp: string;
  status: string;  // Puede ser cualquier string del backend
  rsn: string;
  reject_code?: string;  // Código de rechazo (ej: "AB01", "MD09", etc.)
  bless_numbers?: number[];
  // Campos alternativos que pueden venir del backend
  blessed_numbers?: number[];
  transactionId?: string;
  bookingId?: string;
  refIbp?: string;
  rejectCode?: string;
  blessNumbers?: number[];
  blessedNumbers?: number[];
}

export async function requestDebitOtp(payload: RequestOtpPayload): Promise<void> {
  const url = API_ENDPOINTS.payments.requestOtp();
  logger.request('POST', url, payload, { service: 'Payments' });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  // Intentar parsear el body de la respuesta
  let data: unknown = null;
  try {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Si no es JSON válido, guardar como string
        data = text;
      }
    }
  } catch (e) {
    // Si no hay body, data queda null
  }
  
  logger.response('POST', url, response.status, data, { service: 'Payments' });
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      if (data) {
        if (typeof data === 'object' && data !== null) {
          const errorData = data as { message?: string; error?: string };
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    logger.error(errorMessage, data, { service: 'Payments' });
    throw new Error(errorMessage || `Error al procesar la solicitud. Código: ${response.status}`);
  }
}

/**
 * Procesa el débito y retorna el transaction_id generado por SyPago
 * Este transaction_id identifica el intento de débito en SyPago
 */
export async function processDebit(payload: ProcessDebitPayload): Promise<ProcessDebitResponse> {
  const url = API_ENDPOINTS.payments.processDebit();
  logger.request('POST', url, payload, { service: 'Payments' });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  logger.response('POST', url, response.status, data, { service: 'Payments' });
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    logger.error(errorMessage, data, { service: 'Payments' });
    throw new Error(errorMessage || `Error al procesar la solicitud. Código: ${response.status}`);
  }
  
  const result: ProcessDebitResponse = data;
  logger.info('Transaction ID generado por SyPago', { transaction_id: result.transaction_id }, { service: 'Payments' });
  
  return result;
}

/**
 * Consulta el estado de una transacción
 */
export async function getTransactionStatus(
  transactionId: string,
  bookingId: string
): Promise<TransactionStatusResponse> {
  const url = API_ENDPOINTS.payments.transactionStatus(transactionId, bookingId);
  const queryParams = { transactionId, bookingId };
  
  logger.request('GET', url, queryParams, { service: 'Payments' });
  
  const response = await fetch(url);
  const data = await response.json();
  
  logger.response('GET', url, response.status, data, { service: 'Payments' });
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    logger.error(errorMessage, data, { service: 'Payments' });
    throw new Error(errorMessage || `Error al procesar la solicitud. Código: ${response.status}`);
  }
  
  // Mapear la respuesta para asegurar que bless_numbers esté presente
  // El backend puede retornar 'bless_numbers' o 'blessed_numbers'
  const mappedData: TransactionStatusResponse = {
    transaction_id: data.transaction_id || data.transactionId,
    booking_id: data.booking_id || data.bookingId,
    ref_ibp: data.ref_ibp || data.refIbp,
    status: data.status,
    rsn: data.rsn || data.reason || '',
    reject_code: data.reject_code || data.rejectCode,
    // Manejar ambos formatos posibles
    bless_numbers: data.bless_numbers || data.blessed_numbers || data.blessNumbers || data.blessedNumbers,
  };
  
  // Log para debug
  if (mappedData.bless_numbers && mappedData.bless_numbers.length > 0) {
    console.log('Bless numbers encontrados:', mappedData.bless_numbers);
  }
  
  return mappedData;
}

/**
 * Polling para consultar el estado de la transacción
 * - Primer intento: 750ms después del inicio
 * - Incremento: +350ms en cada intento
 * - Timeout total: 20 segundos
 * 
 * Estados de SyPago:
 * - PROC: En proceso
 * - PEND: Pendiente
 * - AC00: En proceso
 * - ACCP: Aceptado (estado final)
 * - RJCT: Rechazado (estado final)
 * 
 * Solo ACCP y RJCT son estados finales válidos
 * Cualquier otro estado continúa el polling
 */
export async function pollTransactionStatus(
  transactionId: string,
  bookingId: string,
  onStatusUpdate?: (status: string) => void
): Promise<TransactionStatusResponse & { finalStatus: TransactionStatus }> {
  const startTime = Date.now();
  const MAX_DURATION = 20000; // 20 segundos
  let delay = 750; // Primer intento a los 750ms
  const INCREMENT = 350; // Incremento de 350ms

  const poll = async (): Promise<TransactionStatusResponse & { finalStatus: TransactionStatus }> => {
    // Verificar si hemos excedido el tiempo máximo
    const elapsed = Date.now() - startTime;
    if (elapsed >= MAX_DURATION) {
      return {
        transaction_id: transactionId,
        booking_id: bookingId,
        ref_ibp: '',
        status: 'TIMEOUT',
        rsn: 'El tiempo de espera ha expirado. Por favor, contacte con soporte para conocer el estado final de su transacción.',
        finalStatus: 'TIMEOUT',
      };
    }

    // Esperar el delay antes de consultar
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const result = await getTransactionStatus(transactionId, bookingId);
      
      // Notificar cambio de estado
      if (onStatusUpdate) {
        onStatusUpdate(result.status);
      }

      // Solo ACCP y RJCT son estados finales válidos
      if (result.status === 'ACCP') {
        return {
          ...result,
          finalStatus: 'ACCP',
        };
      }

      if (result.status === 'RJCT') {
        return {
          ...result,
          finalStatus: 'RJCT',
        };
      }

      // Cualquier otro estado: continuar polling
      delay += INCREMENT; // Incrementar delay para el siguiente intento
      return poll(); // Recursión
    } catch (error) {
      // Si hay error en la consulta, reintentar
      delay += INCREMENT;
      return poll();
    }
  };

  return poll();
}


