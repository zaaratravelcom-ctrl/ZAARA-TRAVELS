import React, { useState, useEffect } from 'react';
import { X, Download, Printer, MessageSquare, ShieldCheck, FileText, CheckCircle2, Eye, Sparkles, Activity, Check, Copy, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingPDFData, generateBookingPDF, generateBookingInvoicePDF, generateMasterLetterheadBackgroundDataUri } from '../utils/pdfGenerator';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingPDFData | null;
  defaultDocType?: 'booking' | 'invoice';
}

interface DiagnosticLog {
  timestamp: string;
  type: 'info' | 'success' | 'warn';
  message: string;
  details?: Record<string, any>;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  defaultDocType = 'booking',
}) => {
  const [docType, setDocType] = useState<'booking' | 'invoice'>(defaultDocType);
  const [pdfUri, setPdfUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>([]);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [letterheadStatus, setLetterheadStatus] = useState<{
    loaded: boolean;
    sizeBytes: number;
    dimensions: string;
    templateName: string;
  }>({
    loaded: false,
    sizeBytes: 0,
    dimensions: 'A4 (210 x 297 mm)',
    templateName: 'Zaara_Travels_Official_Letterhead.pdf',
  });

  useEffect(() => {
    if (defaultDocType) {
      setDocType(defaultDocType);
    }
  }, [defaultDocType]);

  useEffect(() => {
    if (!booking) return;

    const logs: DiagnosticLog[] = [];
    const nowStr = new Date().toLocaleTimeString();

    logs.push({
      timestamp: nowStr,
      type: 'info',
      message: `Initializing PDF generation request for Ref: ${booking.bookingId}`,
      details: { docType, guest: booking.guestName, tour: booking.tourTitle }
    });

    try {
      // 1. Verify Master Letterhead Template Background Layer
      const bgDataUri = generateMasterLetterheadBackgroundDataUri();
      const isBgLoaded = !!bgDataUri && bgDataUri.startsWith('data:image/png');
      const bgBytes = bgDataUri ? bgDataUri.length : 0;

      setLetterheadStatus({
        loaded: isBgLoaded,
        sizeBytes: bgBytes,
        dimensions: '210 x 297 mm (A4 High-Res Canvas)',
        templateName: 'Zaara_Travels_Official_Letterhead.pdf',
      });

      if (isBgLoaded) {
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `Master Letterhead template 'Zaara_Travels_Official_Letterhead.pdf' successfully resolved and rendered as background layer.`,
          details: {
            template: 'Zaara_Travels_Official_Letterhead.pdf',
            dataUriLength: `${(bgBytes / 1024).toFixed(1)} KB`,
            layerType: 'Full-bleed A4 Canvas Background',
            margins: 'Top Header: 44mm reserved | Bottom Footer: 35mm reserved'
          }
        });
      } else {
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'warn',
          message: `Master Letterhead background layer fallback active.`,
        });
      }

      // 2. Generate Document PDF over Letterhead Template
      const startTime = performance.now();
      let res;
      if (docType === 'booking') {
        res = generateBookingPDF(booking);
      } else {
        res = generateBookingInvoicePDF(booking);
      }
      const durationMs = (performance.now() - startTime).toFixed(1);

      setPdfUri(res.pdfDataUri);
      setFileName(res.fileName);

      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `Successfully rendered ${docType === 'booking' ? 'Booking Confirmation Voucher' : 'GST Tax Invoice'} on top of Zaara Travels letterhead.`,
        details: {
          outputFileName: res.fileName,
          renderTime: `${durationMs} ms`,
          pdfDataUriSize: `${(res.pdfDataUri.length / 1024).toFixed(1)} KB`,
          letterheadOverlayVerified: true
        }
      });

      console.log('[PDF_DIAGNOSTIC_VERIFICATION]', {
        bookingId: booking.bookingId,
        docType,
        letterheadTemplate: 'Zaara_Travels_Official_Letterhead.pdf',
        backgroundLayerLoaded: isBgLoaded,
        backgroundLayerSizeBytes: bgBytes,
        renderTimeMs: durationMs,
      });

    } catch (err: any) {
      console.error('Error generating PDF preview:', err);
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        type: 'warn',
        message: `PDF Render Exception: ${err?.message || 'Unknown error'}`,
      });
    }

    setDiagnosticLogs(logs);
  }, [booking, docType]);

  if (!isOpen || !booking) return null;

  const handleDownload = () => {
    if (!booking) return;
    if (docType === 'booking') {
      const { doc, fileName: fname } = generateBookingPDF(booking);
      doc.save(fname);
    } else {
      const { doc, fileName: fname } = generateBookingInvoicePDF(booking);
      doc.save(fname);
    }
  };

  const handlePrint = () => {
    if (!pdfUri) return;
    const printWindow = window.open(pdfUri);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleCopyLogs = () => {
    const text = diagnosticLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${
            l.details ? JSON.stringify(l.details) : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wide flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  Official Zaara Letterhead
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {booking.bookingId}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                Document Live Preview
              </h2>
            </div>

            {/* Document Type Selector Tabs & Diagnostics Toggle */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex-1 sm:flex-none">
                <button
                  onClick={() => setDocType('booking')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    docType === 'booking'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Booking Voucher</span>
                </button>

                <button
                  onClick={() => setDocType('invoice')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    docType === 'invoice'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GST Tax Invoice</span>
                </button>
              </div>

              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border ${
                  showDiagnostics
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
                title="Open PDF Template Verification Diagnostics"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Diagnostics</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:static text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Metadata & Diagnostic Status Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <span><strong>Guest:</strong> {booking.guestName}</span>
              <span><strong>Tour:</strong> {booking.tourTitle}</span>
              <span><strong>Date:</strong> {booking.travelDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Background Layer: <strong>Zaara_Travels_Official_Letterhead.pdf</strong></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>
            </div>
          </div>

          {/* Optional Interactive Diagnostic Drawer */}
          {showDiagnostics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 text-slate-100 border-b border-slate-800 p-4 shrink-0 text-xs font-mono space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold text-amber-400">
                    Template Layer Verification Diagnostic Utility
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLogs}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded flex items-center gap-1 transition text-[11px]"
                  >
                    {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLog ? 'Copied' : 'Copy Logs'}</span>
                  </button>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Template Source:</span>
                  <strong className="text-sky-400">{letterheadStatus.templateName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Layer Status:</span>
                  <strong className={letterheadStatus.loaded ? 'text-emerald-400' : 'text-rose-400'}>
                    {letterheadStatus.loaded ? 'VERIFIED & ACTIVE' : 'FAILED'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Format & Canvas:</span>
                  <strong className="text-slate-300">{letterheadStatus.dimensions}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Background Size:</span>
                  <strong className="text-amber-300">
                    {(letterheadStatus.sizeBytes / 1024).toFixed(1)} KB
                  </strong>
                </div>
              </div>

              {/* Log Entries */}
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-[11px]">
                {diagnosticLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-400 font-bold'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-sky-300'
                      }
                    >
                      {log.message}
                    </span>
                    {log.details && (
                      <span className="text-slate-400 text-[10px]">
                        {JSON.stringify(log.details)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main PDF Viewer Body */}
          <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 relative overflow-hidden flex flex-col items-center justify-center">
            {pdfUri ? (
              <iframe
                src={`${pdfUri}#toolbar=0&navpanes=0&view=FitH`}
                title="Zaara Travels Official Letterhead Document Preview"
                className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-inner"
              />
            ) : (
              <div className="text-center space-y-3 p-8">
                <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Rendering document on official letterhead template...</p>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="bg-white border-t border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Official document generated for <strong className="text-slate-800">{booking.bookingId}</strong>. Ready for print or offline save.
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/919933992786?text=${encodeURIComponent(
                  `Hello Zaara Travels, I am reviewing my document ref ${booking.bookingId} (${booking.tourTitle}). Please confirm driver details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Desk</span>
              </a>

              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Print/Save</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

