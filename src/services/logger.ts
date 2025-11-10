/**
 * Servicio de logging simple para desarrollo y debugging
 * Permite activar/desactivar logs fácilmente
 */

// Flag global para activar/desactivar logs
// Cambiar a false para desactivar todos los logs
const ENABLED = true;

// Prefijo para identificar logs del servicio
const LOG_PREFIX = '[API]';

interface LogOptions {
  service?: string;
  method?: string;
  url?: string;
}

/**
 * Logger principal
 */
class Logger {
  private enabled: boolean;

  constructor(enabled: boolean = ENABLED) {
    this.enabled = enabled;
  }

  /**
   * Activa o desactiva el logger
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verifica si el logger está activo
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log de información general
   */
  info(message: string, data?: unknown, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.buildPrefix(options);
    console.log(`${prefix} ${message}`, data || '');
  }

  /**
   * Log de request HTTP
   */
  request(method: string, url: string, body?: unknown, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.buildPrefix(options);
    console.group(`${prefix} → REQUEST [${method}] ${url}`);
    
    if (body) {
      console.log('📤 Request Body:', JSON.stringify(body, null, 2));
    }
    
    console.groupEnd();
  }

  /**
   * Log de response HTTP exitoso
   */
  response(
    method: string,
    url: string,
    status: number,
    body: unknown,
    options?: LogOptions
  ): void {
    if (!this.enabled) return;
    
    const prefix = this.buildPrefix(options);
    const statusEmoji = status >= 200 && status < 300 ? '✅' : '⚠️';
    
    console.group(`${prefix} ← RESPONSE [${method}] ${url}`);
    console.log(`${statusEmoji} Status Code: ${status}`);
    console.log('📥 Response Body:', JSON.stringify(body, null, 2));
    console.groupEnd();
  }

  /**
   * Log de error
   */
  error(message: string, error?: unknown, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.buildPrefix(options);
    console.error(`${prefix} ❌ ERROR: ${message}`, error || '');
  }

  /**
   * Log de warning
   */
  warn(message: string, data?: unknown, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.buildPrefix(options);
    console.warn(`${prefix} ⚠️ WARNING: ${message}`, data || '');
  }

  /**
   * Construye el prefijo del log
   */
  private buildPrefix(options?: LogOptions): string {
    const parts = [LOG_PREFIX];
    
    if (options?.service) {
      parts.push(`[${options.service}]`);
    }
    
    return parts.join(' ');
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Exportar también la clase por si se necesita crear instancias adicionales
export { Logger };

