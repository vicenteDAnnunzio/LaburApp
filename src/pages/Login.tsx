import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, User, Loader2 } from 'lucide-react';
import { login, register } from '../data/api';
import type { RegisterData } from '../data/api';
import { validateEmail, validatePassword, validateRequired, validatePasswordMatch } from '../lib/validation';
import { Alert } from '../components/Alert';
import { InputField } from '../components/InputField';

type UserRole = 'client' | 'provider';

const ZONAS = ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Almagro', 'Flores', 'Villa Urquiza', 'San Telmo', 'Microcentro', 'Núñez'];
const SERVICIOS = ['Plomero', 'Electricista', 'Gasista', 'Jardinero', 'Pintor', 'Carpintero', 'Cerrajero', 'Albañil', 'Techista'];

export const Login = () => {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('client');
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // Provider fields
  const [providerZona, setProviderZona] = useState('');
  const [providerServicios, setProviderServicios] = useState<string[]>([]);
  const [providerExperiencia, setProviderExperiencia] = useState('');
  const [providerDescripcion, setProviderDescripcion] = useState('');
  const [providerTelefono, setProviderTelefono] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginErrors({});
    setIsLoading(true);

    const errors: { email?: string; password?: string } = {};

    // Validate fields
    const isAdmin = loginEmail === 'admin' && loginPassword === 'admin';
    
    if (!loginEmail) {
      errors.email = 'El email es requerido';
    } else if (!isAdmin && !validateEmail(loginEmail)) {
      errors.email = 'Ingresá un email válido (ej: usuario@ejemplo.com)';
    }

    const passwordValidation = validatePassword(loginPassword);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message;
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await login({ email: loginEmail, password: loginPassword });
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message || 'Email o contraseña incorrectos');
      setIsLoading(false);
    }
  };

  const toggleServicio = (servicio: string) => {
    setProviderServicios(prev =>
      prev.includes(servicio)
        ? prev.filter(s => s !== servicio)
        : [...prev, servicio]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegisterErrors({});
    setIsLoading(true);

    const errors: Record<string, string> = {};

    // Validate basic fields
    const nameValidation = validateRequired(registerName, 'Nombre');
    if (!nameValidation.valid) errors.name = nameValidation.message!;

    if (!registerEmail) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Ingresá un email válido (ej: usuario@ejemplo.com)';
    }

    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message!;
    }

    const matchValidation = validatePasswordMatch(registerPassword, registerConfirmPassword);
    if (!matchValidation.valid) {
      errors.confirmPassword = matchValidation.message!;
    }

    // Validate provider fields if role is provider
    if (registerRole === 'provider') {
      if (!providerZona) errors.zona = 'Seleccioná una zona';
      if (providerServicios.length === 0) errors.servicios = 'Seleccioná al menos un servicio';
      if (!providerExperiencia || parseInt(providerExperiencia) < 0) {
        errors.experiencia = 'Ingresá los años de experiencia';
      }
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const registerData: RegisterData = {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      role: registerRole,
      providerProfile: registerRole === 'provider'
        ? {
            zona: providerZona,
            servicios: providerServicios,
            experiencia: parseInt(providerExperiencia),
            descripcion: providerDescripcion,
            telefono: providerTelefono,
            disponibilidad: 'Entre 24 y 48 hs',
            perfilActivo: true,
          }
        : undefined,
    };

    const result = await register(registerData);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message || 'Error al crear la cuenta');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/fondo.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/60 to-blue-900/80"></div>
      
      <div className="w-full max-w-md relative z-10">

        {/* Auth Card Container */}
        <div className="relative">
          {/* Login Panel */}
          <div
            className={`bg-white rounded-2xl shadow-2xl p-8 transition-all duration-500 ${
              showRegister ? 'md:opacity-0 md:-translate-x-full md:absolute md:inset-0 opacity-100' : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Logo dentro del card */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2.5 mb-2">
                <div className="bg-blue-600 p-2.5 rounded-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  LaburApp
                </h1>
              </div>
              <p className="text-gray-600 text-sm">Encontrá profesionales cerca tuyo</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-5">Iniciar sesión</h2>

            {error && !showRegister && (
              <div className="mb-4">
                <Alert type="error" message={error} onClose={() => setError('')} />
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                id="login-email"
                label="Email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="tu@email.com"
                error={loginErrors.email}
                icon={<Mail className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              <InputField
                id="login-password"
                label="Contraseña"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="••••••••"
                error={loginErrors.password}
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(true);
                    setError('');
                    setLoginErrors({});
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  ¿No tenés cuenta? Registrate
                </button>
              </div>
            </form>
          </div>

          {/* Register Panel */}
          <div
            className={`bg-white rounded-2xl shadow-2xl p-6 transition-all duration-500 max-h-[90vh] overflow-y-auto ${
              showRegister
                ? 'opacity-100 translate-x-0 mt-6 md:mt-0'
                : 'md:opacity-0 md:translate-x-full md:absolute md:inset-0 hidden md:block'
            }`}
          >
            {/* Logo dentro del card */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2.5 mb-2">
                <div className="bg-blue-600 p-2.5 rounded-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  LaburApp
                </h1>
              </div>
              <p className="text-gray-600 text-sm">Encontrá profesionales cerca tuyo</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear cuenta</h2>

            {error && showRegister && (
              <div className="mb-4">
                <Alert type="error" message={error} onClose={() => setError('')} />
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Qué querés hacer? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('client')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                      registerRole === 'client'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    Contratar servicios
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('provider')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                      registerRole === 'provider'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    Prestar servicios
                  </button>
                </div>
              </div>

              <InputField
                id="register-name"
                label="Nombre"
                value={registerName}
                onChange={setRegisterName}
                placeholder="Tu nombre"
                error={registerErrors.name}
                icon={<User className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              <InputField
                id="register-email"
                label="Email"
                value={registerEmail}
                onChange={setRegisterEmail}
                placeholder="tu@email.com"
                error={registerErrors.email}
                icon={<Mail className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              <InputField
                id="register-password"
                label="Contraseña"
                type="password"
                value={registerPassword}
                onChange={setRegisterPassword}
                placeholder="Mínimo 6 caracteres"
                error={registerErrors.password}
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              <InputField
                id="register-confirm-password"
                label="Confirmar contraseña"
                type="password"
                value={registerConfirmPassword}
                onChange={setRegisterConfirmPassword}
                placeholder="••••••••"
                error={registerErrors.confirmPassword}
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={isLoading}
              />

              {/* Provider-specific fields */}
              {registerRole === 'provider' && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 text-sm">Información del prestador</h3>

                  <div>
                    <label htmlFor="provider-zona" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Zona de trabajo <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="provider-zona"
                      value={providerZona}
                      onChange={(e) => setProviderZona(e.target.value)}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border ${
                        registerErrors.zona ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50`}
                    >
                      <option value="">Seleccioná una zona</option>
                      {ZONAS.map(zona => (
                        <option key={zona} value={zona}>{zona}</option>
                      ))}
                    </select>
                    {registerErrors.zona && <p className="mt-1 text-sm text-red-600">{registerErrors.zona}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Servicios que prestás <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICIOS.map(servicio => (
                        <button
                          key={servicio}
                          type="button"
                          onClick={() => toggleServicio(servicio)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            providerServicios.includes(servicio)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          {servicio}
                        </button>
                      ))}
                    </div>
                    {registerErrors.servicios && <p className="mt-1 text-sm text-red-600">{registerErrors.servicios}</p>}
                  </div>

                  <InputField
                    id="provider-experiencia"
                    label="Años de experiencia"
                    type="number"
                    value={providerExperiencia}
                    onChange={setProviderExperiencia}
                    placeholder="0"
                    error={registerErrors.experiencia}
                    required
                    disabled={isLoading}
                  />

                  <div>
                    <label htmlFor="provider-descripcion" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="provider-descripcion"
                      value={providerDescripcion}
                      onChange={(e) => setProviderDescripcion(e.target.value)}
                      disabled={isLoading}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none disabled:opacity-50"
                      placeholder="Contanos sobre tu experiencia..."
                    />
                  </div>

                  <InputField
                    id="provider-telefono"
                    label="Teléfono (opcional)"
                    value={providerTelefono}
                    onChange={setProviderTelefono}
                    placeholder="Ej: 11 1234-5678"
                    disabled={isLoading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                    setRegisterErrors({});
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  Ya tengo cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
