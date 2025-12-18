import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
// Fix: Import GeneratedOutreach which is the correct exported member from types.ts
import { Lead, GeneratedOutreach } from '../types';
import { generateColdOutreach } from '../services/gemini';

interface EmailGeneratorProps {
  lead: Lead;
  onClose: () => void;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ lead, onClose }) => {
  // Fix: Use GeneratedOutreach type for the state
  const [email, setEmail] = useState<GeneratedOutreach | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        // Fix: generateColdOutreach expects only 1 argument.
        const result = await generateColdOutreach(lead);
        setEmail(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmail();
  }, [lead]);

  const handleCopy = () => {
    if (!email) return;
    const text = `Asunto: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Propuesta Generada por IA
            </h3>
            <p className="text-sm text-slate-400 mt-1">Para: {lead.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-slate-300 animate-pulse">Analizando reseñas y redactando pitch...</p>
            </div>
          ) : email ? (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Asunto</span>
                <p className="text-white font-medium mt-1">{email.subject}</p>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cuerpo del Mensaje</span>
                <p className="text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                  {email.body}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400 py-8">Error generando el correo. Intenta nuevamente.</div>
          )}
        </div>

        {/* Footer */}
        {!loading && email && (
          <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all ${
                copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Todo
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};