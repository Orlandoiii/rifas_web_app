import type { Bank } from '../types/payments';
import { API_ENDPOINTS } from '../config/api';

export async function getBanks(signal?: AbortSignal): Promise<Bank[]> {
  const response = await fetch(API_ENDPOINTS.payments.banks(), { signal });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
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
}

export async function requestDebitOtp(payload: RequestOtpPayload): Promise<void> {
  const response = await fetch(API_ENDPOINTS.payments.requestOtp(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Procesa el débito y retorna el transaction_id generado por SyPago
 * Este transaction_id identifica el intento de débito en SyPago
 */
export async function processDebit(payload: ProcessDebitPayload): Promise<ProcessDebitResponse> {
  console.log('Procesando débito con booking_id:', payload.booking_id);
  
  const response = await fetch(API_ENDPOINTS.payments.processDebit(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    throw new Error(errorMessage);
  }
  
  const result: ProcessDebitResponse = await response.json();
  console.log('Respuesta de processDebit:', result);
  console.log('Transaction ID generado por SyPago:', result.transaction_id);
  
  return result;
}

/**
 * Consulta el estado de una transacción
 */
export async function getTransactionStatus(
  transactionId: string,
  bookingId: string
): Promise<TransactionStatusResponse> {
  
  console.log('transactionId', transactionId);
  console.log('bookingId', bookingId);
  
  const response = await fetch(
    API_ENDPOINTS.payments.transactionStatus(transactionId, bookingId)
  );
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    
    throw new Error(errorMessage);
  }
  
  return await response.json();
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


