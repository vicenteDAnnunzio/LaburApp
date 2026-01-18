import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Alert } from '../components/Alert';
import { Moon, Sun, Bell, Globe, Loader2, ArrowLeft } from 'lucide-react';

interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  notifications: true,
  language: 'es',
};

export const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('sf_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load theme
    const theme = localStorage.getItem('sf_theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('sf_theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationsChange = (notifications: boolean) => {
    setSettings(prev => ({ ...prev, notifications }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Save to localStorage
    localStorage.setItem('sf_settings', JSON.stringify(settings));

    setShowSuccess(true);
    setIsLoading(false);
    
    // Auto-hide success toast after 4 seconds
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
              <p className="font-bold text-lg">¡Configuración guardada!</p>
              <p className="text-sm text-green-100">Tus preferencias se actualizaron</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-200">
        <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </button>
        </div>

        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        <div className="space-y-6">
          {/* Appearance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Apariencia</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.theme === 'light' ? (
                    <Sun className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Tema</p>
                    <p className="text-sm text-gray-600">
                      {settings.theme === 'light' ? 'Modo claro' : 'Modo oscuro'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      settings.theme === 'light'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                El modo oscuro está en desarrollo. Por ahora solo está disponible el modo claro.
              </p>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones push</p>
                    <p className="text-sm text-gray-600">
                      Recibí alertas sobre nuevas solicitudes y mensajes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNotificationsChange(!settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Las notificaciones se implementarán cuando haya un backend activo.
              </p>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Idioma</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Idioma de la aplicación</p>
                    <p className="text-sm text-gray-600">
                      Español (Argentina)
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">
                  Español
                </div>
              </div>

              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Por ahora solo está disponible el idioma español.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar configuración'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
