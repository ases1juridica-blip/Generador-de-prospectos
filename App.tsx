
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchForm } from './components/SearchForm';
import { LeadCard } from './components/LeadCard';
import { EmailGenerator } from './components/EmailGenerator';
import { LoginScreen } from './components/LoginScreen';
import { CampaignManager } from './components/CampaignManager';
import { Lead, SearchParams } from './types';
import { findProspects } from './services/gemini';
import { Globe, AlertCircle, Download, Database, Users, CheckCircle, Link as LinkIcon, Play, Sparkles, Target, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // URL Params State
  const [initialCountry, setInitialCountry] = useState('Colombia');
  const [initialCity, setInitialCity] = useState('Bogotá');
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const countryParam = params.get('country');
    const cityParam = params.get('city');

    if (countryParam) setInitialCountry(countryParam);
    if (cityParam) setInitialCity(cityParam);
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setLeads([]);
    
    try {
      const results = await findProspects(params.industry, params.location, params.painPoints);
      setLeads(results);
      if (results.length === 0) {
        setError("No se detectaron prospectos con problemas críticos de atención en este radio. Prueba otra ciudad.");
      }
    } catch (err) {
      setError("Error crítico de conexión con los satélites de IA. Reintenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAgentLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('country', initialCountry);
    params.set('city', initialCity);
    const shareableLink = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(shareableLink);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 3000);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">
      <Navbar />

      <div className="bg-indigo-900/10 border-b border-indigo-900/30 py-2">
         <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <span>Terminal de Agente: {initialCity}, {initialCountry}</span>
            <button 
              onClick={copyAgentLink}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
               {showLinkCopied ? (
                 <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Link Copiado</span>
               ) : (
                 <span className="flex items-center gap-1 opacity-60 hover:opacity-100"><LinkIcon className="h-3 w-3"/> Link de Referencia</span>
               )}
            </button>
         </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-900/20 px-5 py-2 rounded-full border border-indigo-500/20 mb-8 animate-pulse">
             <Zap className="h-4 w-4 text-indigo-400" />
             <span className="text-xs font-black text-indigo-200 uppercase tracking-widest">JGroupTech Advanced Prospecting</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-6 italic uppercase">
            Lead <span className="text-indigo-600">Hunter</span> Alpha
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Identificación de debilidades comerciales y redacción automática de propuestas firmadas por <span className="text-white font-bold border-b-2 border-indigo-600">Jairo Segura</span>.
          </p>
        </div>

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialCountry={initialCountry}
          initialCity={initialCity}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 mb-10 flex items-center gap-4 text-red-200 shadow-2xl">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {!isLoading && leads.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl gap-6">
             <div className="flex items-center gap-6">
               <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-600/30">
                  <Database className="h-7 w-7 text-white" />
               </div>
               <div>
                  <span className="font-black text-white block text-3xl tracking-tighter uppercase italic">{leads.length} Leads Calientes</span>
                  <span className="text-xs text-indigo-500 font-black uppercase tracking-widest">Analizados vía Google Reviews</span>
               </div>
             </div>
             
             <button 
                onClick={() => setShowCampaign(true)}
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-600/20 group uppercase tracking-tighter italic text-lg transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                Lanzar Campaña Masiva
              </button>
          </div>
        )}

        {!isLoading && leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onDraftEmail={setSelectedLead} 
              />
            ))}
          </div>
        )}

        {!isLoading && leads.length === 0 && !error && (
          <div className="text-center py-32 opacity-20 border-2 border-dashed border-slate-800 rounded-[3rem] grayscale">
            <Globe className="h-24 w-24 mx-auto mb-6 text-slate-600" />
            <p className="text-2xl font-black text-slate-500 uppercase tracking-tighter italic">Esperando coordenadas del agente...</p>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-16 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center flex-wrap gap-12 mb-10 grayscale opacity-30">
             <span className="text-sm font-black text-slate-400 tracking-[0.3em]">DUBÁI</span>
             <span className="text-sm font-black text-slate-400 tracking-[0.3em]">MIAMI</span>
             <span className="text-sm font-black text-slate-400 tracking-[0.3em]">BOGOTÁ</span>
             <span className="text-sm font-black text-slate-400 tracking-[0.3em]">LA PAZ</span>
           </div>
           <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] mb-2">
             JGroupTech AI Strategy Agency © {new Date().getFullYear()}
           </p>
           <p className="text-indigo-900 text-[9px] font-black uppercase tracking-[0.8em]">
             System: Gemini 3 Pro Enabled | Secure Agent Portal
           </p>
        </div>
      </footer>

      {selectedLead && (
        <EmailGenerator 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}

      {showCampaign && (
        <CampaignManager 
          leads={leads}
          onUpdateLeads={setLeads}
          onClose={() => setShowCampaign(false)}
        />
      )}
    </div>
  );
};

export default App;
