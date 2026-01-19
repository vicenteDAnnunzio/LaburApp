import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, Wrench, MapPin, Calendar, DollarSign, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { listRequests, updateRequest } from '../data/api';
import { Header } from '../components/Header';
import type { ServiceRequest } from '../types/request';

export const Solicitudes = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'aceptadas' | 'canceladas' | 'rechazadas'>('todas');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const userRequests = await listRequests('client');
      setRequests(userRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = (requestId: string) => {
    setRequestToCancel(requestId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (requestToCancel) {
      try {
        await updateRequest(requestToCancel, { action: 'cancel' });
        await loadRequests();
        setShowCancelModal(false);
        setRequestToCancel(null);
      } catch (error) {
        console.error('Error canceling request:', error);
      }
    }
  };

  const filteredRequests = filter === 'todas' 
    ? requests 
    : requests.filter(r => {
        if (filter === 'pendientes') return r.estado === 'Pendiente';
        if (filter === 'aceptadas') return r.estado === 'Aceptada';
        if (filter === 'canceladas') return r.estado === 'Cancelada';
        if (filter === 'rechazadas') return r.estado === 'Rechazada';
        return true;
      });

  const getStatusIcon = (estado: ServiceRequest['estado']) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Aceptada':
      case 'Completada':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Cancelada':
      case 'Rechazada':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (estado: ServiceRequest['estado']) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Aceptada':
      case 'Completada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelada':
      case 'Rechazada':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancelar solicitud</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que querés cancelar esta solicitud?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setRequestToCancel(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                No, volver
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-md"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis solicitudes</h1>
                <p className="text-gray-600">Gestioná y seguí el estado de tus pedidos de servicio</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Atrás
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['todas', 'pendientes', 'aceptadas', 'canceladas', 'rechazadas'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500">
              {filter === 'todas' 
                ? 'Aún no realizaste ninguna solicitud de servicio.'
                : `No tenés solicitudes ${filter}.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.providerName}</h3>
                      <p className="text-blue-600 font-semibold">{request.providerService}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${getStatusColor(request.estado)}`}>
                    {getStatusIcon(request.estado)}
                    <span className="text-sm font-semibold">{request.estado}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span><strong>Zona:</strong> {request.zona}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span><strong>Urgencia:</strong> {request.urgencia}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span><strong>Solicitado:</strong> {formatDate(request.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span><strong>Método de pago:</strong> {request.metodoPago || 'No especificado'}</span>
                  </div>
                </div>

                {/* Description */}
                {request.descripcion && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Descripción:</strong> {request.descripcion}
                    </p>
                  </div>
                )}

                {/* Address if provided */}
                {request.direccion && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Dirección:</strong> {request.direccion}
                    </p>
                    {request.referencias && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Referencias:</strong> {request.referencias}
                      </p>
                    )}
                  </div>
                )}

                {/* Action hint based on status */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex-1">
                    {request.estado === 'Pendiente' && (
                      <p className="text-xs text-gray-500">
                        El prestador recibirá tu solicitud y se contactará dentro de 24 hs.
                      </p>
                    )}
                    {(request.estado === 'Aceptada' || request.estado === 'Completada') && (
                      <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 inline-block">
                        Servicio {request.estado === 'Completada' ? 'completado' : 'aceptado'}. El prestador se pondrá en contacto pronto.
                      </p>
                    )}
                    {request.estado === 'Cancelada' && (
                      <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 inline-block">
                        ❌ Esta solicitud fue cancelada.
                      </p>
                    )}
                    {request.estado === 'Rechazada' && (
                      <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 inline-block">
                        ❌ Esta solicitud fue rechazada.
                      </p>
                    )}
                  </div>
                  
                  {request.estado === 'Pendiente' && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm shadow-md"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
