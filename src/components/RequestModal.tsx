import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Wrench, Clock, DollarSign } from 'lucide-react';
import { Alert } from './Alert';
import type { Provider } from '../types';
import type { UrgenciaOption, ContactoOption } from '../types/request';
import { saveRequest } from '../lib/requests';
import { getUser } from '../lib/auth';

interface RequestModalProps {
  provider: Provider;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultZona?: string;
}

const ZONAS = ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Almagro', 'Flores', 'Villa Urquiza', 'San Telmo', 'Microcentro', 'Núñez'];
const URGENCIA_OPTIONS: UrgenciaOption[] = [
  'Lo antes posible (hoy / < 24 hs)',
  'Entre 24 y 48 hs',
  'Entre 48 y 72 hs',
  'Esta semana'
];
const CONTACTO_OPTIONS: ContactoOption[] = ['Email', 'Teléfono'];

export const RequestModal = ({ provider, isOpen, onClose, onSuccess, defaultZona = '' }: RequestModalProps) => {
  const [zona, setZona] = useState(defaultZona);
  const [urgencia, setUrgencia] = useState<UrgenciaOption>('Entre 24 y 48 hs');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencias, setReferencias] = useState('');
  const [contactoPreferido, setContactoPreferido] = useState<ContactoOption>('Email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const validationErrors: Record<string, string> = {};

    if (!zona) validationErrors.zona = 'Seleccioná una zona';
    if (!urgencia) validationErrors.urgencia = 'Seleccioná la urgencia';
    if (!contactoPreferido) validationErrors.contacto = 'Seleccioná un método de contacto';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const user = getUser();
    if (!user) {
      setError('Error: usuario no encontrado');
      setIsLoading(false);
      return;
    }

    const request = {
      id: `req_${Date.now()}`,
      providerId: provider.id.toString(),
      providerName: provider.name,
      providerService: provider.service,
      providerZona: provider.zona,
      zona,
      urgencia,
      descripcion,
      direccion,
      referencias,
      contactoPreferido,
      estado: 'Pendiente' as const,
      fecha: new Date().toISOString(),
      userEmail: user.email,
    };

    saveRequest(request);
    setIsLoading(false);
    
    // Reset form
    setZona(defaultZona);
    setUrgencia('Entre 24 y 48 hs');
    setDescripcion('');
    setDireccion('');
    setReferencias('');
    setContactoPreferido('Email');
    
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Solicitar servicio</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* Provider Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 mb-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-blue-700 font-semibold mb-2">{provider.service}</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{provider.zona}</span>
                </div>
              </div>
            </div>

            {/* Info Lines */}
            <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span><strong>Costo estimado:</strong> a coordinar</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span><strong>Respuesta:</strong> dentro de 24 hs</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="zona" className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Zona del servicio <span className="text-red-500">*</span>
              </label>
              <select
                id="zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 ${
                  errors.zona ? 'border-red-300' : 'border-gray-200'
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white disabled:opacity-50`}
              >
                <option value="">Seleccioná una zona</option>
                {ZONAS.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              {errors.zona && <p className="mt-1 text-sm text-red-600">{errors.zona}</p>}
            </div>

            <div>
              <label htmlFor="urgencia" className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Urgencia <span className="text-red-500">*</span>
              </label>
              <select
                id="urgencia"
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as UrgenciaOption)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 ${
                  errors.urgencia ? 'border-red-300' : 'border-gray-200'
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white disabled:opacity-50`}
              >
                {URGENCIA_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.urgencia && <p className="mt-1 text-sm text-red-600">{errors.urgencia}</p>}
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Descripción del problema (opcional)
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-gray-50 hover:bg-white disabled:opacity-50"
                placeholder="Describí brevemente qué necesitás..."
              />
            </div>

            <div>
              <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                🏠 Dirección (opcional)
              </label>
              <input
                id="direccion"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white disabled:opacity-50"
                placeholder="Ej: Av. Santa Fe 1234, Piso 5, Depto B"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                💡 La dirección exacta es opcional. Podés coordinarla luego con el prestador.
              </p>
            </div>

            <div>
              <label htmlFor="referencias" className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Referencias adicionales (opcional)
              </label>
              <textarea
                id="referencias"
                value={referencias}
                onChange={(e) => setReferencias(e.target.value)}
                disabled={isLoading}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-gray-50 hover:bg-white disabled:opacity-50"
                placeholder="Ej: Portón verde, timbre 5B, cerca de estación..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📞 Contacto preferido <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONTACTO_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setContactoPreferido(opt)}
                    disabled={isLoading}
                    className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      contactoPreferido === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    } disabled:opacity-50`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.contacto && <p className="mt-1 text-sm text-red-600">{errors.contacto}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Confirmar solicitud'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
