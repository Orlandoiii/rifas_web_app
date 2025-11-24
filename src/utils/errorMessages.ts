/**
 * Utilidad para formatear mensajes de error del servidor
 */

/**
 * Formatea un mensaje de error del servidor agregando un prefijo amigable
 * Si el mensaje parece venir del backend (no es un mensaje genérico del frontend),
 * se agrega el prefijo solicitado.
 * 
 * @param errorMessage - Mensaje de error original
 * @returns Mensaje formateado con prefijo si es necesario
 */
export function formatServerError(errorMessage: string): string {
  if (!errorMessage) {
    return 'Lo sentimos, tenemos problemas. Por favor, intente nuevamente.';
  }

  // Mensajes genéricos del frontend que no necesitan prefijo
  const frontendMessages = [
    'No hay',
    'Error al',
    'El tiempo de espera ha expirado',
    'El pago fue rechazado',
    'No se recibió',
    'No se pudieron',
    'Solo se pudieron',
  ];

  // Verificar si el mensaje es un error genérico del frontend
  const isFrontendMessage = frontendMessages.some(prefix => 
    errorMessage.startsWith(prefix)
  );

  // Si es un mensaje del backend (no genérico del frontend), agregar prefijo
  if (!isFrontendMessage) {
    return `Lo sentimos, tenemos problemas y el mensaje del servidor: ${errorMessage}`;
  }

  // Si es un mensaje del frontend, retornarlo tal cual
  return errorMessage;
}

/**
 * Extrae y formatea un mensaje de error desde una excepción
 * 
 * @param err - Error o excepción
 * @param defaultMessage - Mensaje por defecto si no se puede extraer el error
 * @returns Mensaje de error formateado
 */
export function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof Error) {
    return formatServerError(err.message);
  }
  return defaultMessage;
}

