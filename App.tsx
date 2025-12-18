import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchForm } from './components/SearchForm';
import { LeadCard } from './components/LeadCard';
import { EmailGenerator } from './components/EmailGenerator';
import { LoginScreen } from './components/LoginScreen';
import { Lead, SearchParams } from './types';
import { findProspects } from './services/gemini';
import { Globe, AlertCircle, Download, Database, Users, CheckCircle, Link as LinkIcon, Copy } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  
  // URL Params State
  const [initialCountry, setInitialCountry] = useState('Colombia');
  const [initialCity, setInitialCity] = useState('Bogotá');
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  useEffect(() => {
    // Parse URL params for pre-configuration (e.g., ?country=Emiratos Árabes Unidos&city=Dubái)
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
    setShowDownloadSuccess(false);
    
    // Update local state to track what the user selected (for sharing link later)
    const locationParts = params.location.split(', ');
    if (locationParts.length === 2) {
       // A bit rough, but works if format is "City, Country"
       setInitialCity(locationParts[0]);
       setInitialCountry(locationParts[1]);
    }

    try {
      const results = await findProspects(params.industry, params.location, params.painPoints);
      setLeads(results);
      if (results.length === 0) {
        setError("No se encontraron prospectos con quejas específicas en esta zona. Intenta ampliar la búsqueda.");
      }
    } catch (err) {
      setError("Error al conectar con Google Maps y Gemini. Asegúrate de que la API Key sea válida y tenga acceso.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = () => {
    if (leads.length === 0) return;

    try {
      // Prepare data for Excel with friendly headers
      const excelData = leads.map(lead => ({
        "Nombre Empresa": lead.name,
        "Industria": lead.category,
        "Ciudad": lead.city,
        "Dirección": lead.address,
        "Teléfono": lead.phone || 'No disponible',
        "Email Contacto": lead.email || 'No disponible',
        "Nombre Propietario/Encargado": lead.ownerName || 'Gerente General',
        "Nombre Gerente": lead.managerName || '',
        "Website": lead.websiteUri || '',
        "Rating Google": lead.rating || 0,
        "Total Reseñas": lead.userRatingCount || 0,
        "Resumen Problemas": lead.sentimentAnalysis.summary,
        "Link Maps": lead.googleMapsUri || '',
        "Estado": lead.contactStatus === 'new' ? 'Nuevo' : 'Contactado'
      }));

      // Create worksheet and workbook
      const worksheet = utils.json_to_sheet(excelData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Prospectos");

      // Generate filename with date
      const fileName = `Prospectos_JGroupTech_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Trigger download
      writeFile(workbook, fileName);

      // Show success message
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Export error", err);
      setError("Hubo un problema al generar el archivo Excel. Por favor intenta de nuevo.");
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

      <div className="bg-indigo-900/20 border-b border-indigo-900/50 py-2">
         <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-indigo-300">
            <span>Ubicación Actual: {initialCity}, {initialCountry}</span>
            <button 
              onClick={copyAgentLink}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
               {showLinkCopied ? (
                 <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle className="h-3 w-3"/> Enlace Copiado</span>
               ) : (
                 <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3"/> Generar Enlace para Agente</span>
               )}
            </button>
         </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-900/30 px-4 py-1.5 rounded-full border border-indigo-500/30 mb-4">
             <Users className="h-4 w-4 text-indigo-400" />
             <span className="text-sm font-medium text-indigo-200">Portal para Agentes Comerciales</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Generador de Base de Datos <span className="text-indigo-500">JGroupTech</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Herramienta interna para localizar clientes potenciales con problemas de atención al cliente y exportar datos para campañas de Email Marketing.
          </p>
        </div>

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialCountry={initialCountry}
          initialCity={initialCity}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-8 flex items-center gap-3 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400" />
            {error}
          </div>
        )}
        
        {showDownloadSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 mb-8 flex items-center gap-3 text-emerald-200 animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Base de datos exportada exitosamente. Revisa tu carpeta de descargas.
          </div>
        )}

        {/* Export Section */}
        {!isLoading && leads.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg gap-4">
             <div className="flex items-center gap-2">
               <Database className="h-5 w-5 text-indigo-400" />
               <span className="font-medium text-white">{leads.length} Prospectos Encontrados</span>
             </div>
             <button 
               onClick={downloadExcel}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
             >
               <Download className="h-4 w-4" />
               Descargar Excel (.xlsx)
             </button>
          </div>
        )}

        {!isLoading && leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-800 rounded-xl">
            <Globe className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-500 font-medium">Selecciona País, Ciudad y Sector para generar leads.</p>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-500 text-sm">
             © {new Date().getFullYear()} JGroupTech AI Agency. Herramienta de uso interno para prospección.
           </p>
        </div>
      </footer>

      {selectedLead && (
        <EmailGenerator 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}
    </div>
  );
};

export default App;