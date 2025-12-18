
import React from 'react';
import { Lead } from '../types';
import { Star, Phone, ExternalLink, AlertTriangle, Mail, User, Building, TrendingDown, Zap } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onDraftEmail: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onDraftEmail }) => {
  const score = lead.sentimentAnalysis.score;
  const isHotLead = score > 80;
  
  return (
    <div className={`bg-slate-900 rounded-[2rem] p-6 border transition-all duration-300 hover:-translate-y-1 ${isHotLead ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'border-slate-800'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-white tracking-tight leading-tight">{lead.name}</h3>
            {isHotLead && <Zap className="h-4 w-4 text-indigo-500 fill-indigo-500" />}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
               <Building className="h-3 w-3" /> {lead.address}
            </p>
            {lead.phone && (
               <p className="text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                 <Phone className="h-3 w-3" /> {lead.phone}
               </p>
            )}
          </div>
        </div>
        <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex flex-col items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mb-1" />
            <span className="text-white font-black text-sm">{lead.rating || 'N/A'}</span>
        </div>
      </div>

      {/* Financial Loss Badge */}
      <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
        <div className="bg-red-500 p-2 rounded-xl">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Pérdida Estimada</p>
          <p className="text-lg font-black text-white leading-none">
            ${lead.sentimentAnalysis.estimatedMonthlyLoss?.toLocaleString()} <span className="text-xs text-red-500 font-bold">USD / mes</span>
          </p>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-slate-950/50 rounded-2xl p-4 mb-6 border border-slate-800/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score de Conversión</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isHotLead ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {score}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isHotLead ? 'bg-indigo-500' : 'bg-slate-600'}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-sm text-slate-400 italic mb-4 line-clamp-2">"{lead.sentimentAnalysis.summary}"</p>
        
        <div className="flex flex-wrap gap-2">
          {lead.sentimentAnalysis.painPoints.map((point, idx) => (
            <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-800">
              #{point.replace(/\s+/g, '')}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
           {lead.googleMapsUri && (
             <a href={lead.googleMapsUri} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
               <ExternalLink className="h-5 w-5" />
             </a>
           )}
           {lead.websiteUri && (
             <a href={lead.websiteUri} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
               <Building className="h-5 w-5" />
             </a>
           )}
        </div>
        <button
          onClick={() => onDraftEmail(lead)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Proponer
        </button>
      </div>
    </div>
  );
};
