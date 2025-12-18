
import React, { useState } from 'react';
import { Lead } from '../types';
import { X, Send, MessageSquare, Mail, CheckCircle, RefreshCw, Download, Play, ShieldCheck, Smartphone, Edit3, TrendingDown, DollarSign, Target } from 'lucide-react';
import { generateColdOutreach } from '../services/gemini';
import { utils, writeFile } from 'xlsx';

interface CampaignManagerProps {
  leads: Lead[];
  onUpdateLeads: (updatedLeads: Lead[]) => void;
  onClose: () => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ leads, onUpdateLeads, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats calculation
  const totalMarketValue = leads.reduce((acc, lead) => acc + (lead.sentimentAnalysis.estimatedMonthlyLoss || 0), 0);
  const hotLeadsCount = leads.filter(l => l.sentimentAnalysis.score > 80).length;

  const generateBulkDrafts = async () => {
    setIsGenerating(true);
    const updatedLeads = [...leads];
    
    for (let i = 0; i < updatedLeads.length; i++) {
      if (!updatedLeads[i].personalizedDraft) {
        try {
          const draft = await generateColdOutreach(updatedLeads[i]);
          updatedLeads[i] = { 
            ...updatedLeads[i], 
            personalizedDraft: draft,
            contactStatus: 'drafted'
          };
          onUpdateLeads([...updatedLeads]);
        } catch (e) {
          console.error("Error en lead:", updatedLeads[i].name);
        }
      }
    }
    setIsGenerating(false);
  };

  const exportCombinedExcel = () => {
    const data = leads.map(l => ({
      "RAZÓN SOCIAL": l.name,
      "REPRESENTANTE": l.ownerName || 'Gerente',
      "ESTIMADO PÉRDIDA": `$${l.sentimentAnalysis.estimatedMonthlyLoss} USD`,
      "EMAIL": l.email || 'N/A',
      "TELÉFONO": l.phone || 'N/A',
      "EMAIL - ASUNTO": l.personalizedDraft?.subject || 'PENDIENTE',
      "EMAIL - CUERPO": l.personalizedDraft?.body || 'PENDIENTE',
      "WA - MENSAJE": l.personalizedDraft?.whatsappMessage || 'PENDIENTE',
    }));

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Lead Analysis");
    writeFile(workbook, `JGroupTech_Campaign_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const sendWhatsApp = (lead: Lead) => {
    if (!lead.personalizedDraft || !lead.phone) return;
    const phone = lead.phone.replace(/\D/g, '');
    const text = encodeURIComponent(lead.personalizedDraft.whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const sendEmail = (lead: Lead) => {
    if (!lead.personalizedDraft || !lead.email) return;
    const subject = encodeURIComponent(lead.personalizedDraft.subject);
    const body = encodeURIComponent(lead.personalizedDraft.body);
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleUpdateField = (id: string, field: 'body' | 'whatsappMessage' | 'smsMessage', value: string) => {
    onUpdateLeads(leads.map(l => l.id === id && l.personalizedDraft ? {
      ...l,
      personalizedDraft: { ...l.personalizedDraft, [field]: value }
    } : l));
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Campaign Master <span className="text-indigo-500">Alpha</span></h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">JGroupTech | Dubái HQ Control</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4">
          <button 
            onClick={generateBulkDrafts}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 uppercase tracking-tighter italic"
          >
            {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            Redacción Estratégica
          </button>
          
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-slate-500">
            <X className="h-8 w-8" />
          </button>
        </div>
      </header>

      {/* Stats Ribbon */}
      <div className="bg-indigo-600 py-3 px-6 flex justify-around items-center border-y border-indigo-400/30 overflow-x-auto gap-10">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <TrendingDown className="h-5 w-5 text-indigo-200" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Pérdida de Mercado Total:</span>
            <span className="text-lg font-black text-white italic">${totalMarketValue.toLocaleString()} USD</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Target className="h-5 w-5 text-indigo-200" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Leads Críticos (Hot):</span>
            <span className="text-lg font-black text-white italic">{hotLeadsCount}</span>
          </div>
          <button 
            onClick={exportCombinedExcel}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-xl border border-white/20 text-xs font-black transition-all"
          >
            <Download className="h-4 w-4" /> EXPORTAR MASTER FILE
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-10">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30 group">
              <div className="p-8 bg-slate-900/50 border-b border-slate-800 flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className={`h-6 w-6 rounded-full ${lead.personalizedDraft ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'}`} />
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{lead.name}</h3>
                    <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" /> Pérdida Estimada: ${lead.sentimentAnalysis.estimatedMonthlyLoss} USD/mes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Probabilidad</p>
                      <p className="text-2xl font-black text-indigo-400 italic">{lead.sentimentAnalysis.score}%</p>
                   </div>
                </div>
              </div>

              {lead.personalizedDraft ? (
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Propuesta Corporativa
                      </span>
                      <button onClick={() => sendEmail(lead)} className="text-[10px] bg-indigo-600 text-white px-4 py-1 rounded-full font-bold">ENVIAR EMAIL</button>
                    </div>
                    <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 group/edit relative">
                      <p className="text-[10px] text-indigo-600 font-bold mb-3 uppercase">Asunto: {lead.personalizedDraft.subject}</p>
                      <textarea 
                        value={lead.personalizedDraft.body}
                        onChange={(e) => handleUpdateField(lead.id, 'body', e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-400 font-sans min-h-[220px] focus:outline-none leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Pitch WhatsApp
                      </span>
                      <button onClick={() => sendWhatsApp(lead)} className="text-[10px] bg-emerald-600 text-white px-4 py-1 rounded-full font-bold">ABRIR WHATSAPP</button>
                    </div>
                    <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
                      <textarea 
                        value={lead.personalizedDraft.whatsappMessage}
                        onChange={(e) => handleUpdateField(lead.id, 'whatsappMessage', e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-400 font-sans min-h-[160px] focus:outline-none leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <RefreshCw className="h-12 w-12 text-slate-800 mx-auto" />
                  <p className="text-slate-600 font-black uppercase tracking-widest italic">Análisis Estratégico Pendiente...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
