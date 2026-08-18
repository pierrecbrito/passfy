import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Volume2,
  VolumeX,
  History,
  QrCode,
  ArrowRight,
} from 'lucide-react';

interface EventSummary {
  id: string;
  title: string;
  venue: string;
  date: string;
}

export const GatekeeperPage: React.FC = () => {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Play synthetic Web Audio feedback tones
  const playSoundFeedback = (status: string) => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (status === 'VALID') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (status === 'ALREADY_USED') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted
    }
  };

  // Load events list for portaria selector
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get('/events');
        const list = response.data.events || [];
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load events for gatekeeper:', err);
      }
    }
    loadEvents();
  }, []);

  // Handle Camera Scanner Lifecycle
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (activeTab === 'CAMERA' && selectedEventId) {
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode
          .start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleValidate({ qrToken: decodedText });
            },
            () => {}
          )
          .then(() => setIsScanning(true))
          .catch((err) => {
            console.warn('Camera could not start:', err);
            setIsScanning(false);
          });
      }
    }

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, [activeTab, selectedEventId]);

  const handleValidate = async (params: { qrToken?: string; ticketCode?: string }) => {
    if (!selectedEventId) {
      alert('Por favor, selecione o evento da portaria antes de validar.');
      return;
    }

    setIsValidating(true);

    try {
      const response = await api.post('/checkin/validate', {
        eventId: selectedEventId,
        qrToken: params.qrToken,
        ticketCode: params.ticketCode,
      });

      const result = response.data;
      setValidationResult(result);
      playSoundFeedback(result.status);

      setRecentLogs((prev) => [
        { ...result, timestamp: new Date(), input: params.ticketCode || 'QR Code' },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      const result = err.response?.data || {
        status: 'INVALID',
        message: 'Erro de comunicação ao validar ingresso.',
      };
      setValidationResult(result);
      playSoundFeedback(result.status || 'INVALID');

      setRecentLogs((prev) => [
        { ...result, timestamp: new Date(), input: params.ticketCode || 'QR Code' },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsValidating(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidate({ ticketCode: manualCode.trim() });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2 shadow-xs">
              <QrCode className="w-3.5 h-3.5" />
              <span>Controle de Acesso em Tempo Real</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Validação de Portaria
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Escaneie com a câmera ou digite o código alfanumérico para liberar a entrada
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Som Ativado</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>Som Desativado</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Event Selector Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-xs">
          <label className="block text-xs font-bold text-slate-700">
            Sessão / Evento em Validação:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setValidationResult(null);
            }}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {ev.venue} ({new Date(ev.date).toLocaleDateString('pt-BR')})
              </option>
            ))}
          </select>
        </div>

        {/* Scanner & Manual Input Tabs */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('CAMERA')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'CAMERA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Leitor de Câmera</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'MANUAL'
                  ? 'bg-[#2b55f5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Digitação Manual</span>
            </button>
          </div>

          {/* Camera Scanner View */}
          {activeTab === 'CAMERA' ? (
            <div className="text-center space-y-4">
              <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50 p-4">
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
                {!isScanning && (
                  <div className="py-8 text-xs text-slate-500 space-y-2">
                    <p className="font-semibold">Iniciando sensor de câmera...</p>
                    <p className="text-[11px] text-slate-400">
                      Se solicitado, autorize o acesso à câmera no seu navegador.
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Aponte a câmera para o QR Code do ingresso do cliente
              </p>
            </div>
          ) : (
            /* Manual Code Form */
            <form onSubmit={handleManualSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Código Alfanumérico do Ingresso
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Ex: PAS-DEMO1 ou PAS-8X9K2"
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono uppercase tracking-wider text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="px-5 py-3 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>{isValidating ? 'Validando...' : 'Validar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Dica para teste rápido: use o código pré-semeado <strong className="text-slate-800 font-mono">PAS-DEMO1</strong>.
                </p>
              </div>
            </form>
          )}

          {/* Validation Result Box */}
          {validationResult && (
            <div className="pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95">
              {validationResult.status === 'VALID' && (
                <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-xs text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-800">
                    ENTRADA AUTORIZADA!
                  </h3>
                  <div className="max-w-sm mx-auto p-4 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1.5 text-left text-slate-700 shadow-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Cliente:</span>
                      <strong className="text-slate-900 font-bold">
                        {validationResult.ticket?.customerName}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Assento / Setor:</span>
                      <strong className="text-emerald-700 font-black text-sm">
                        {validationResult.ticket?.seatLabel
                          ? `Poltrona ${validationResult.ticket.seatLabel}`
                          : 'Pista Geral'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Código:</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {validationResult.ticket?.ticketCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {validationResult.status === 'ALREADY_USED' && (
                <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-400 shadow-xs text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-amber-800">
                    INGRESSO JÁ UTILIZADO!
                  </h3>
                  <p className="text-xs text-amber-900 font-medium max-w-md mx-auto">
                    {validationResult.message}
                  </p>
                  {validationResult.validatedBy && (
                    <div className="text-[11px] text-slate-600 font-medium">
                      Validado por: <strong className="text-slate-900 font-bold">{validationResult.validatedBy}</strong>
                    </div>
                  )}
                </div>
              )}

              {validationResult.status === 'WRONG_EVENT' && (
                <div className="p-6 rounded-3xl bg-sky-50 border-2 border-sky-400 shadow-xs text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center mx-auto shadow-xs">
                    <Clock className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-sky-900">
                    EVENTO INCORRETO!
                  </h3>
                  <p className="text-xs text-sky-800 font-medium max-w-md mx-auto">
                    {validationResult.message}
                  </p>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Sessão atual: <strong className="text-slate-900 font-bold">{selectedEvent?.title}</strong>
                  </div>
                </div>
              )}

              {validationResult.status === 'INVALID' && (
                <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-400 shadow-xs text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-xs">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-rose-800">
                    INGRESSO INVÁLIDO OU FORJADO!
                  </h3>
                  <p className="text-xs text-rose-700 font-medium max-w-md mx-auto">
                    {validationResult.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Validation History Log */}
        {recentLogs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Histórico Recente de Validações da Sessão</span>
            </h3>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.status === 'VALID'
                          ? 'success'
                          : log.status === 'ALREADY_USED'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {log.status === 'VALID'
                        ? 'Liberado'
                        : log.status === 'ALREADY_USED'
                        ? 'Já Utilizado'
                        : log.status === 'WRONG_EVENT'
                        ? 'Outro Evento'
                        : 'Inválido'}
                    </Badge>
                    <span className="font-mono text-slate-800 font-bold">{log.input}</span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
