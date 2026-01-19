import { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { SearchSection } from '../components/SearchSection';
import { ProviderCard } from '../components/ProviderCard';
import { listProviders } from '../data/api';
import { Users } from 'lucide-react';
import type { Provider } from '../types';

export const Home = () => {
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    setHasSearched(true);
    
    try {
      const results = await listProviders({
        zona: selectedZona || undefined,
        servicio: selectedService || undefined,
      });

      setFilteredProviders(results);
    } catch (error) {
      console.error('Error loading providers:', error);
      setFilteredProviders([]);
    }

    // Scroll suave a los resultados con delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <SearchSection
        selectedZona={selectedZona}
        selectedService={selectedService}
        onZonaChange={setSelectedZona}
        onServiceChange={setSelectedService}
        onSearch={handleSearch}
      />

      {hasSearched && (
        <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">
                {filteredProviders.length} profesional{filteredProviders.length !== 1 ? 'es' : ''} encontrado{filteredProviders.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-gray-600 mt-1">
                {selectedZona && selectedService && `${selectedService} en ${selectedZona}`}
                {selectedZona && !selectedService && `Todos los servicios en ${selectedZona}`}
                {!selectedZona && selectedService && `${selectedService} en todas las zonas`}
                {!selectedZona && !selectedService && 'Todos los profesionales disponibles'}
              </p>
            </div>
          </div>

          {filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider} 
                  selectedZona={selectedZona}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No se encontraron profesionales
              </h3>
              <p className="text-gray-600 mb-6">
                No hay profesionales disponibles con los criterios seleccionados.
              </p>
              <button
                onClick={() => {
                  setSelectedZona('');
                  setSelectedService('');
                  setHasSearched(false);
                }}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Volver a buscar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
