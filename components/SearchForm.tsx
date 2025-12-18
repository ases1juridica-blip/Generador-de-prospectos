import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Loader2, Filter, Globe, Map } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  initialCountry?: string;
  initialCity?: string;
  initialCategory?: string;
}

// Categorías e Industrias completas
const INDUSTRIES: Record<string, string[]> = {
  "Salud": [
    "Médicos Generales", "Odontólogos", "Psicólogos", "Esteticistas", 
    "Clínicas", "Optómetras", "Fisioterapeutas", "Quiroprácticos", "Dermatólogos", "Pediatras", "Nutricionistas"
  ],
  "Belleza y Bienestar": [
    "Salones de Belleza", "Spas", "Barberías", "Centros de Uñas", "Centros de Bronceo", "Maquilladores", "Depilación Láser"
  ],
  "Hostelería y Turismo": [
    "Restaurantes", "Hoteles", "Cafeterías", "Bares", "Gastrobares", "Agencias de Viajes", "Hostales", "Glampings"
  ],
  "Comercio Minorista": [
    "Droguerías / Farmacias", "Ópticas", "Tiendas de Ropa", "Floristerías", "Ferreterías", "Tiendas de Mascotas", "Jugueterías", "Joyerías"
  ],
  "Servicios Profesionales": [
    "Abogados", "Contadores", "Inmobiliarias", "Seguros", "Arquitectos", "Consultores de Marketing", "Notarías"
  ],
  "Automotriz": [
      "Talleres Mecánicos", "Concesionarios", "Lavaderos de Autos", "Venta de Repuestos", "Centros de Diagnóstico"
  ],
  "Educación": [
      "Colegios Privados", "Jardines Infantiles", "Academias de Idiomas", "Escuelas de Música", "Centros de Tutoría"
  ]
};

// Estructura País -> Ciudades
const LOCATIONS: Record<string, string[]> = {
  "Colombia": [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", 
    "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Cúcuta", "Villavicencio", "Ibagué"
  ],
  "Estados Unidos": [
    "Miami", "Orlando", "New York", "Los Angeles", "Houston", "Chicago", "Austin", "San Francisco"
  ],
  "Emiratos Árabes Unidos": [
    "Dubái", "Abu Dabi", "Sharjah", "Ajman"
  ],
  "México": [
    "Ciudad de México", "Monterrey", "Guadalajara", "Cancún", "Puebla", "Tijuana", "Mérida", "Querétaro"
  ],
  "España": [
    "Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Bilbao", "Zaragoza"
  ],
  "Bolivia": [
    "La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Sucre", "Tarija"
  ],
  "Perú": [
    "Lima", "Arequipa", "Trujillo", "Cusco", "Piura"
  ],
  "Chile": [
    "Santiago", "Valparaíso", "Concepción", "Viña del Mar", "Antofagasta"
  ],
  "Argentina": [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"
  ],
  "Ecuador": [
    "Quito", "Guayaquil", "Cuenca", "Manta"
  ],
  "Panamá": [
    "Ciudad de Panamá", "Colón", "David"
  ]
};

export const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, 
  isLoading, 
  initialCountry = 'Colombia', 
  initialCity = 'Bogotá',
  initialCategory = 'Salud'
}) => {
  // Estados para Industria
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState(INDUSTRIES[initialCategory]?.[0] || 'Odontólogos');

  // Estados para Ubicación
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  
  // Estado para ubicación personalizada (fallback)
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  // Efecto para actualizar cuando cambian las props iniciales (ej. desde URL)
  useEffect(() => {
    if (initialCountry && LOCATIONS[initialCountry]) {
        setSelectedCountry(initialCountry);
        if (initialCity && LOCATIONS[initialCountry].includes(initialCity)) {
            setSelectedCity(initialCity);
        } else {
            setSelectedCity(LOCATIONS[initialCountry][0]);
        }
    }
  }, [initialCountry, initialCity]);

  // Actualizar sub-industrias al cambiar categoría
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    if (INDUSTRIES[cat] && INDUSTRIES[cat].length > 0) {
      setSelectedSubIndustry(INDUSTRIES[cat][0]);
    }
  };

  // Actualizar ciudades al cambiar país
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    if (country === "Otro...") {
        setIsCustomLocation(true);
        setSelectedCountry("");
        return;
    }
    setSelectedCountry(country);
    setIsCustomLocation(false);
    if (LOCATIONS[country] && LOCATIONS[country].length > 0) {
      setSelectedCity(LOCATIONS[country][0]);
    } else {
      setSelectedCity("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let locationString = "";
    if (isCustomLocation) {
        locationString = customLocation;
    } else {
        locationString = `${selectedCity}, ${selectedCountry}`;
    }

    onSearch({
      industry: selectedSubIndustry,
      location: locationString,
      painPoints: ['Mala atención telefónica', 'No contestan', 'Trato grosero', 'No agendan citas', 'Tiempos de espera largos']
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700">
        <Search className="h-5 w-5 text-indigo-400" />
        Configuración de Prospección
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SECCIÓN 1: TERRITORIO */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Map className="h-4 w-4" /> 1. Definir Territorio
                </h3>
                <div className="grid grid-cols-1 gap-4">
                     {/* Selector de País */}
                    <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase">País</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-slate-500" />
                        </div>
                        {!isCustomLocation ? (
                        <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-colors hover:border-slate-500"
                        >
                            {Object.keys(LOCATIONS).map(country => (
                            <option key={country} value={country}>{country}</option>
                            ))}
                            <option value="Otro...">Otro / Escribir manual...</option>
                        </select>
                        ) : (
                            <button 
                            type="button"
                            onClick={() => { setIsCustomLocation(false); setSelectedCountry('Colombia'); }}
                            className="block w-full pl-10 bg-slate-800 border border-slate-600 border-dashed rounded-lg py-3 text-slate-400 hover:text-white text-left transition-colors"
                            >
                            Volver a lista de países
                            </button>
                        )}
                    </div>
                    </div>

                    {/* Selector de Ciudad */}
                    <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase">Ciudad</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        </div>
                        
                        {!isCustomLocation ? (
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-colors hover:border-slate-500"
                        >
                            {LOCATIONS[selectedCountry]?.map(city => (
                            <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        ) : (
                        <input
                            type="text"
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                            className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ej: París, Francia"
                            required={isCustomLocation}
                        />
                        )}
                    </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: CLIENTE */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> 2. Perfil del Cliente
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {/* Selector de Categoría */}
                    <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase">Sector / Industria</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-500" />
                        </div>
                        <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-colors hover:border-slate-500"
                        >
                        {Object.keys(INDUSTRIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                    </div>
                    </div>

                    {/* Selector de Especialidad */}
                    <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase">Especialidad</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                        </div>
                        <select
                        value={selectedSubIndustry}
                        onChange={(e) => setSelectedSubIndustry(e.target.value)}
                        className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-colors hover:border-slate-500"
                        >
                        {INDUSTRIES[selectedCategory]?.map((sub: string) => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                        </select>
                    </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Botón de Búsqueda */}
        <div className="pt-4 border-t border-slate-700/50">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Buscando Clientes Potenciales...</span>
              </>
            ) : (
              <>
                <Search className="h-6 w-6" />
                <span className="text-lg">Iniciar Búsqueda de Prospectos</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};