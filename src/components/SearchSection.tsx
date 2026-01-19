import { useState } from 'react';
import { Search, Shield, Star, MapPin, Wrench, Zap, AlertCircle } from 'lucide-react';
import type { Zona, Service } from '../types';

interface SearchSectionProps {
  selectedZona: string;
  selectedService: string;
  onZonaChange: (zona: string) => void;
  onServiceChange: (service: string) => void;
  onSearch: () => void;
}

const zonas: Zona[] = ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Almagro', 'Flores', 'Villa Urquiza', 'San Telmo', 'Microcentro'];
const services: Service[] = ['Plomero', 'Electricista', 'Gasista', 'Jardinero', 'Pintor', 'Carpintero', 'Cerrajero'];

export const SearchSection = ({
  selectedZona,
  selectedService,
  onZonaChange,
  onServiceChange,
  onSearch,
}: SearchSectionProps) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    if (!selectedZona) {
      setErrorMessage('Por favor seleccioná una zona');
      return;
    }
    if (!selectedService) {
      setErrorMessage('Por favor seleccioná un servicio');
      return;
    }
    setErrorMessage('');
    onSearch();
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden pb-0">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-white mb-4">
            Buscá el servicio que necesitás
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Profesionales de confianza cerca tuyo
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">150+</div>
              <div className="text-sm text-blue-200">Profesionales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">9</div>
              <div className="text-sm text-blue-200">Zonas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">7</div>
              <div className="text-sm text-blue-200">Servicios</div>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="zona" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Zona
              </label>
              <select
                id="zona"
                value={selectedZona}
                onChange={(e) => onZonaChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 font-medium"
              >
                <option value="">Seleccioná una zona</option>
                {zonas.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="servicio" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Servicio
              </label>
              <select
                id="servicio"
                value={selectedService}
                onChange={(e) => onServiceChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 font-medium"
              >
                <option value="">Seleccioná un servicio</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar profesionales
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verificados</h3>
            <p className="text-blue-100 text-sm">
              Todos los profesionales están verificados y tienen experiencia comprobada
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Respuesta rápida</h3>
            <p className="text-blue-100 text-sm">
              Los profesionales responden en menos de 24 horas
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Calidad garantizada</h3>
            <p className="text-blue-100 text-sm">
              Profesionales con años de experiencia en su área
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
