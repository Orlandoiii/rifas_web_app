import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface TermsAndConditionsProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  disabled?: boolean;
  onSubmitAttempt?: (callback: () => void) => void;
}

const TERMS_AND_CONDITIONS = `Estos Términos y Condiciones (T&C) regulan la participación en las rifas y sorteos organizados por Tu Sorteo Ganador, en adelante "El Organizador", a través de la aplicación web.

1. El número total de boletos o números disponibles para la compra en cada rifa o sorteo será de diez mil (10.000). El sorteo solo se llevará a cabo una vez que se haya vendido la cantidad total de boletos.

2. El método de selección del ganador será de acuerdo al sorteo realizado y anunciado por la Lotería del Táchira de la República Bolivariana de Venezuela, además será claramente definido la cantidad de premios a otorgar según se describa en la publicidad de cada sorteo antes de la venta de los boletos.

3. El sorteo ha sido debidamente autorizado por la Comisión Nacional de Lotería (CONALOT).

4. Requisitos de Participación:

a. Debe ser mayor de dieciocho (18) años y poseer plena capacidad legal para contraer obligaciones.

b. La compra de cualquier boleto implica la aceptación incondicional de todos los puntos de estos Términos y Condiciones.

5. Entrega y Notificación de Premios

a. Notificación: El ganador será notificado por medio de Correo electrónico, Número de teléfono o Red social dentro de las 24 horas siguientes a la realización del sorteo.

b. Entrega de premios: El ganador deberá presentarse en el lugar indicado por @tusorteoganador para el retiro del premio, junto con su cédula de identidad o pasaporte. En caso de no poder asistir puede autorizar de manera legal a un representante y, previa verificaciones pertinentes, se le entregará el premio.

c. Plazo: El ganador dispone de un plazo de Noventa días calendario a partir de la notificación oficial para reclamar y coordinar la entrega del premio. Si el premio no es reclamado en este plazo, El Organizador podrá disponer del premio o realizar un nuevo sorteo.

d. Impuestos: Cualquier impuesto, tasa o gasto asociado al premio será responsabilidad exclusiva del ganador.

6. Uso de Imagen y Propiedad Intelectual

Al aceptar el premio, el ganador autoriza expresamente a @tusorteoganador (o "El Organizador") a utilizar, difundir y publicar su nombre, imagen, voz y datos biográficos en cualquiera de sus redes sociales, plataformas y medios de comunicación con fines publicitarios, informativos o promocionales relacionados con el sorteo, sin derecho a compensación adicional.

a. Material: Esta autorización incluye la difusión de fotografías y videos tomados durante la entrega del premio.

7. Descalificación y Anulación

a. Fraude: El Organizador se reserva el derecho de descalificar a cualquier participante que se compruebe que ha incurrido en fraude, manipulación del sistema o violación de estos T&C.

b. Información Falsa: La presentación de información de contacto o identidad falsa resultará en la descalificación inmediata y la anulación del derecho a recibir el premio.

c. Anulación de Sorteo: El Organizador se reserva el derecho de anular, suspender o modificar la rifa o sorteo en caso de fuerza mayor, problemas técnicos que impidan su correcta ejecución. En este caso, se procederá al reembolso íntegro de las participaciones compradas.`;

export default function TermsAndConditions({
  accepted,
  onChange,
  disabled = false,
  onSubmitAttempt
}: TermsAndConditionsProps) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Registrar función de activación de validaciones con el stepper
  React.useEffect(() => {
    if (onSubmitAttempt) {
      onSubmitAttempt(() => {
        setHasAttemptedSubmit(true);
      });
    }
  }, [onSubmitAttempt]);

  // Detectar si el usuario ha scrolleado hasta el final o si no hay scroll necesario
  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de margen

    if (isAtBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  }, [hasScrolled]);

  // Verificar si el contenido requiere scroll al montar
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollHeight, clientHeight } = container;
    // Si el contenido cabe sin scroll, permitir aceptar inmediatamente
    if (scrollHeight <= clientHeight + 10) {
      setHasScrolled(true);
    }
  }, []);

  const showError = hasAttemptedSubmit && !accepted;
  const canAccept = hasScrolled;

  return (
    <div className="space-y-4">
      <div className="bg-bg-tertiary/40 border border-border-light rounded-lg p-4">
        <h3 className="text-text-primary font-semibold mb-3">Términos y Condiciones</h3>
        
        {/* Contenedor con scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-64 overflow-y-auto pr-2 text-sm text-text-secondary leading-relaxed border border-border-light rounded-lg p-4 bg-bg-secondary"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-border-light) transparent'
          }}
        >
          <div className="whitespace-pre-line">
            {TERMS_AND_CONDITIONS}
          </div>
        </div>

        {/* Indicador de scroll */}
        {!hasScrolled && (
          <p className="text-xs text-text-secondary mt-2 text-center">
            Por favor, desplázate hasta el final para leer todos los términos
          </p>
        )}
      </div>

      {/* Mensaje de error */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Debes aceptar los términos y condiciones para continuar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasAttemptedSubmit(false)}
                className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                aria-label="Cerrar error"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkbox de aceptación */}
      <div className="flex items-start gap-3 p-4 bg-bg-tertiary/40 border border-border-light rounded-lg">
        <div className="flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            id="accept-terms"
            checked={accepted}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled || !canAccept}
            className="w-4 h-4 rounded border-2 border-border-light bg-bg-secondary text-selected focus:ring-2 focus:ring-selected focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors checked:bg-selected checked:border-selected"
            style={{
              accentColor: 'var(--color-selected)'
            }}
          />
        </div>
        <label
          htmlFor="accept-terms"
          className={`text-sm text-text-primary cursor-pointer flex-1 ${
            (disabled || !canAccept) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          He leído y acepto los Términos y Condiciones
        </label>
      </div>

      {!canAccept && (
        <p className="text-xs text-text-secondary text-center">
          Debes leer todos los términos desplazándote hasta el final antes de poder aceptarlos
        </p>
      )}
    </div>
  );
}

