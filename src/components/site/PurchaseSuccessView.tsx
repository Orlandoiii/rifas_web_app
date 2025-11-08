import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import Modal from '../lib/components/modal/core/Modal';
import { Button } from '../lib/components/button';
import type { RaffleSummary } from '../../types/raffles';

export interface PurchaseSuccessData {
  // IDs de transacción
  transactionId: string;
  refIbp: string;
  bookingId: string;
  
  // Datos de la rifa
  raffle: RaffleSummary;
  
  // Datos del comprador
  buyer: {
    name: string;
    email: string;
    phone: string;
    id: string;
  };
  
  // Tickets comprados
  tickets: number[];
  
  // Monto pagado
  amount: number;
  currency: string;
}

interface PurchaseSuccessViewProps {
  data: PurchaseSuccessData | null;
  open: boolean;
  onClose: () => void;
}

interface CopyButtonProps {
  value: string;
  label: string;
}

function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Intentar con la API moderna del clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback: Error al copiar', err);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-bg-secondary rounded-lg border border-border-light">
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-xs text-text-muted mb-1 font-medium">{label}</p>
        <p className="text-xs sm:text-sm font-mono font-semibold text-text-primary truncate break-all">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 p-2 sm:p-2.5 rounded-lg transition-colors bg-bg-tertiary hover:bg-selected/20 active:bg-selected/30 touch-manipulation"
        title={copied ? 'Copiado' : 'Copiar'}
        aria-label={copied ? 'Copiado' : 'Copiar al portapapeles'}
      >
        {copied ? (
          <Check className="w-5 h-5 text-state-success" />
        ) : (
          <Copy className="w-5 h-5 text-text-secondary" />
        )}
      </button>
    </div>
  );
}

export default function PurchaseSuccessView({ data, open, onClose }: PurchaseSuccessViewProps) {
  if (!data) return null;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // ============ ENCABEZADO CON LOGO ============
      // Dibujar trébol (4 círculos formando un trébol)
      const logoX = 25;
      const logoY = 25;
      const leafSize = 4;
      
      pdf.setFillColor(27, 160, 136); // Verde menta
      // Hoja superior
      pdf.circle(logoX, logoY - leafSize, leafSize, 'F');
      // Hoja izquierda
      pdf.circle(logoX - leafSize, logoY, leafSize, 'F');
      // Hoja derecha
      pdf.circle(logoX + leafSize, logoY, leafSize, 'F');
      // Hoja inferior (más pequeña para el tallo)
      pdf.circle(logoX, logoY + leafSize, leafSize, 'F');
      // Tallo
      pdf.setLineWidth(1.5);
      pdf.setDrawColor(27, 160, 136);
      pdf.line(logoX, logoY + leafSize, logoX, logoY + leafSize + 3);

      // Nombre de la empresa
      pdf.setTextColor(27, 160, 136);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TuSorteoGanador', 40, 23);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Tu oportunidad de ganar', 40, 29);

      // Línea divisoria
      pdf.setDrawColor(27, 160, 136);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 38, pageWidth - margin, 38);

      yPos = 48;

      // ============ TÍTULO DEL COMPROBANTE ============
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMPROBANTE DE COMPRA', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(formatDate(), pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      // ============ INFORMACIÓN EN DOS COLUMNAS ============
      const col1X = margin;
      const col2X = pageWidth / 2 + 5;
      const colWidth = (contentWidth / 2) - 5;

      // COLUMNA 1: Detalles de la Rifa
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text('RIFA', col1X, yPos);
      yPos += 5;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.raffle.title, col1X, yPos, { maxWidth: colWidth });
      yPos += 5;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const descLines = pdf.splitTextToSize(data.raffle.shortDescription, colWidth);
      pdf.text(descLines, col1X, yPos);
      
      // COLUMNA 2: Monto
      const col2YStart = 66;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text('MONTO PAGADO', col2X, col2YStart);
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text(formatCurrency(data.amount, data.currency), col2X, col2YStart + 10);

      yPos = Math.max(yPos + descLines.length * 4, col2YStart + 15) + 8;

      // ============ DATOS DEL PARTICIPANTE ============
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text('PARTICIPANTE', margin, yPos);
      yPos += 6;

      const participantInfo = [
        { label: 'Nombre', value: data.buyer.name },
        { label: 'Cédula', value: data.buyer.id },
        { label: 'Email', value: data.buyer.email },
        { label: 'Teléfono', value: data.buyer.phone },
      ];

      participantInfo.forEach((item) => {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label + ':', margin, yPos);
        
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, margin + 25, yPos);
        yPos += 5;
      });

      yPos += 5;

      // ============ NÚMEROS DE LA SUERTE ============
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text('NÚMEROS DE LA SUERTE', margin, yPos);
      yPos += 6;

      // Dibujar números de forma simple
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(240, 185, 11);
      
      const ticketsText = data.tickets.join('  •  ');
      const ticketLines = pdf.splitTextToSize(ticketsText, contentWidth);
      pdf.text(ticketLines, margin, yPos);
      yPos += ticketLines.length * 7 + 3;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Total: ${data.tickets.length} ticket${data.tickets.length > 1 ? 's' : ''}`, margin, yPos);
      yPos += 10;

      // ============ REFERENCIAS DE TRANSACCIÓN ============
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(27, 160, 136);
      pdf.text('REFERENCIAS', margin, yPos);
      yPos += 6;

      const references = [
        { label: 'ID Transacción', value: data.transactionId },
        { label: 'Ref. IBP', value: data.refIbp },
        { label: 'Reserva', value: data.bookingId },
      ];

      references.forEach((ref) => {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont('helvetica', 'normal');
        pdf.text(ref.label + ':', margin, yPos);
        
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(ref.value, margin + 30, yPos);
        yPos += 5;
      });

      yPos += 5;

      // ============ CÓDIGO QR ============
      // Generar QR con URL (por ahora fija, más adelante con ID firmado)
      const qrUrl = `https://tusorteoganador.com/verify/${data.transactionId}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Posicionar QR al final de la página con más espacio
      const qrSize = 40;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = pageHeight - 70;

      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // Texto debajo del QR
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Escanea para verificar autenticidad', pageWidth / 2, qrY + qrSize + 6, { align: 'center' });

      // ============ FOOTER ============
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text('TuSorteoGanador © 2025', pageWidth / 2, pageHeight - 8, { align: 'center' });

      // Descargar
      const fileName = `Comprobante_${data.transactionId}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClose = async () => {
    await generatePDF();
    onClose();
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      size="xl" 
      title="¡Compra Exitosa!"
      lockBodyScroll
      closeOnBackdropClick={false}
    >
      {/* Contenido del modal */}
      <div className="space-y-6 overflow-x-hidden">
        {/* Header con ícono de éxito y fecha */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-state-success rounded-full flex items-center justify-center shadow-lg"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <p className="text-sm text-text-muted">
            {formatDate()}
          </p>
        </div>

        {/* Contenido del ticket */}
        {/* Información de la rifa */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Detalles de la Rifa
          </h3>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
            <h4 className="font-bold text-xl text-text-primary mb-2">
              {data.raffle.title}
            </h4>
            <p className="text-sm text-text-secondary">
              {data.raffle.shortDescription}
            </p>
          </div>
        </div>

        {/* Datos del comprador */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Datos del Participante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-secondary rounded-lg p-3 border border-border-light">
              <p className="text-xs text-text-muted mb-1 font-medium">Nombre</p>
              <p className="text-sm font-semibold text-text-primary">
                {data.buyer.name}
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3 border border-border-light">
              <p className="text-xs text-text-muted mb-1 font-medium">Cédula</p>
              <p className="text-sm font-semibold text-text-primary">
                {data.buyer.id}
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3 border border-border-light">
              <p className="text-xs text-text-muted mb-1 font-medium">Email</p>
              <p className="text-sm font-semibold text-text-primary truncate">
                {data.buyer.email}
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3 border border-border-light">
              <p className="text-xs text-text-muted mb-1 font-medium">Teléfono</p>
              <p className="text-sm font-semibold text-text-primary">
                {data.buyer.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Tickets comprados */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Tus Números de la Suerte
          </h3>
          <div className="bg-bg-tertiary rounded-xl p-3 sm:p-4 border-2 border-binance-main">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              {data.tickets.map((ticket, index) => (
                <motion.div
                  key={ticket}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-binance-main rounded-lg flex items-center justify-center shadow-lg border-2 border-binance-dark"
                >
                  <span className="text-lg sm:text-2xl font-bold text-white">
                    {ticket}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-border-light flex justify-between items-center">
              <span className="text-sm font-semibold text-text-secondary">
                Total de tickets:
              </span>
              <span className="text-lg font-bold text-binance-main">
                {data.tickets.length}
              </span>
            </div>
          </div>
        </div>

        {/* Monto pagado */}
        <div className="bg-bg-tertiary rounded-xl p-3 sm:p-4 border-2 border-mint-main">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Monto Total Pagado:
            </span>
            <span className="text-xl sm:text-2xl font-bold text-mint-main">
              {formatCurrency(data.amount, data.currency)}
            </span>
          </div>
        </div>

        {/* Referencias de transacción */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Referencias de Transacción
          </h3>
          <div className="space-y-3">
            <CopyButton
              label="ID de Transacción"
              value={data.transactionId}
            />
            <CopyButton
              label="Referencia IBP"
              value={data.refIbp}
            />
            <CopyButton
              label="Número de Reserva"
              value={data.bookingId}
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-bg-tertiary border-2 border-state-info rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-text-primary text-center font-medium">
            <strong className="font-bold text-state-info">¡Importante!</strong> Guarda estas referencias para cualquier consulta futura.
            Al cerrar esta ventana se descargará automáticamente un comprobante en PDF.
          </p>
        </div>
      </div>
      {/* Fin del contenido del modal */}

      {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
          <Button
            onClick={generatePDF}
            variant="secondary"
            className="flex-1 w-full"
            disabled={isGeneratingPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1 w-full"
            disabled={isGeneratingPDF}
          >
            Entendido
          </Button>
        </div>
    </Modal>
  );
}
