import React from 'react';
import { Lead } from '../types';
import { Star, Phone, ExternalLink, AlertTriangle, Mail, User, Building } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onDraftEmail: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onDraftEmail }) => {
  const isHotLead = lead.sentimentAnalysis.score > 70;
  
  return (
    <div className={`bg-slate-800 rounded-xl p-6 border transition-all duration-200 hover:shadow-xl ${isHotLead ? 'border-red-500/50 shadow-red-900/10' : 'border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{lead.name}</h3>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-400 flex items-center gap-1">
               <Building className="h-3 w-3" /> {lead.address}
            </p>
            {lead.phone && (
               <p className="text-sm text-slate-400 flex items-center gap-1">
                 <Phone className="h-3 w-3" /> {lead.phone}
               </p>
            )}
            {lead.ownerName && lead.ownerName !== 'Gerente General' && (
               <p className="text-sm text-indigo-400 flex items-center gap-1">
                 <User className="h-3 w-3" /> Resp: {lead.ownerName}
               </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-white font-bold">{lead.rating || 'N/A'}</span>
            <span className="text-xs text-slate-500">({lead.userRatingCount || 0})</span>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
            isHotLead ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            Probabilidad de Venta: {lead.sentimentAnalysis.score}%
          </span>
        </div>
        <p className="text-sm text-slate-300 italic mb-2 line-clamp-3">"{lead.sentimentAnalysis.summary}"</p>
        <div className="flex flex-wrap gap-1">
          {lead.sentimentAnalysis.painPoints.slice(0, 3).map((point, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              <AlertTriangle className="h-3 w-3" />
              {point}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="flex gap-2">
           {lead.googleMapsUri && (
             <a 
               href={lead.googleMapsUri} 
               target="_blank" 
               rel="noreferrer"
               className="text-slate-400 hover:text-indigo-400 transition-colors"
               title="Ver en Maps"
             >
               <ExternalLink className="h-5 w-5" />
             </a>
           )}
           {lead.websiteUri && (
             <a 
               href={lead.websiteUri} 
               target="_blank" 
               rel="noreferrer"
               className="text-slate-400 hover:text-indigo-400 transition-colors"
               title="Ver Sitio Web"
             >
               <Building className="h-5 w-5" />
             </a>
           )}
        </div>
        <button
          onClick={() => onDraftEmail(lead)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-md"
        >
          <Mail className="h-4 w-4" />
          Redactar
        </button>
      </div>
    </div>
  );
};
