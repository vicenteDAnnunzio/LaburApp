import { useState } from 'react';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import type { Provider } from '../types';
import { RequestModal } from './RequestModal';

interface ProviderCardProps {
  provider: Provider;
  selectedZona?: string;
}

export const ProviderCard = ({ provider, selectedZona }: ProviderCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-green-500">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">¡Solicitud enviada!</p>
              <p className="text-sm text-green-100">El profesional te contactará pronto</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {provider.name}
        </h3>
        <p className="text-blue-600 font-semibold text-base">{provider.service}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium">{provider.zona}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium">{provider.experience} años de experiencia</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-sm font-medium">
            {provider.available ? (
              <span className="text-green-600 font-semibold">Disponible hoy</span>
            ) : (
              <span className="text-gray-500">No disponible</span>
            )}
          </span>
        </div>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      >
        Solicitar servicio
      </button>
    </div>

    <RequestModal
      provider={provider}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={handleSuccess}
      defaultZona={selectedZona}
    />
  </>
  );
};
