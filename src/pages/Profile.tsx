import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { Alert } from '../components/Alert';
import { Toggle } from '../components/Toggle';
import { SectionHeading } from '../components/SectionHeading';
import { User, Mail, Camera, Loader2, Lock, LogOut, ArrowLeft } from 'lucide-react';
import { getUser, updateUser, getProviderProfile, updateProviderProfile, clearSession } from '../lib/auth';
import type { User as UserType, ProviderProfile } from '../lib/auth';
import { validateRequired, validatePassword } from '../lib/validation';

const ZONAS = ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Almagro', 'Flores', 'Villa Urquiza', 'San Telmo', 'Microcentro', 'Núñez'];
const SERVICIOS = ['Plomero', 'Electricista', 'Gasista', 'Jardinero', 'Pintor', 'Carpintero', 'Cerrajero', 'Albañil', 'Techista'];
const DISPONIBILIDAD_OPTIONS = ['Disponible hoy', 'Disponible esta semana', 'Disponible en 48 hs'];

const PRESET_AVATARS = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧'];

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [accountCreated] = useState(new Date().toLocaleDateString('es-AR'));

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Provider states
  const [zona, setZona] = useState('');
  const [servicios, setServicios] = useState<string[]>([]);
  const [experiencia, setExperiencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('Disponible hoy');
  const [perfilActivo, setPerfilActivo] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatar(currentUser.avatar || '👤');

      if (currentUser.role === 'provider') {
        const profile = getProviderProfile();
        if (profile) {
          setZona(profile.zona);
          setServicios(profile.servicios);
          setExperiencia(profile.experiencia.toString());
          setDescripcion(profile.descripcion || '');
          setTelefono(profile.telefono || '');
          setDisponibilidad(profile.disponibilidad || 'Disponible hoy');
          setPerfilActivo(profile.perfilActivo ?? true);
        }
      }
    }
  }, []);

  const toggleServicio = (servicio: string) => {
    setServicios(prev =>
      prev.includes(servicio)
        ? prev.filter(s => s !== servicio)
        : [...prev, servicio]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrors({});
    setIsLoading(true);

    const validationErrors: Record<string, string> = {};

    // Validate basic fields
    const nameValidation = validateRequired(name, 'Nombre');
    if (!nameValidation.valid) {
      validationErrors.name = nameValidation.message!;
    }

    // Validate provider fields
    if (user?.role === 'provider') {
      if (!zona) validationErrors.zona = 'Seleccioná una zona';
      if (servicios.length === 0) validationErrors.servicios = 'Seleccioná al menos un servicio';
      if (!experiencia || parseInt(experiencia) < 0) {
        validationErrors.experiencia = 'Ingresá los años de experiencia';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Update user
    if (user) {
      const updatedUser: UserType = {
        ...user,
        name,
        email,
        avatar,
      };
      updateUser(updatedUser);
      setUser(updatedUser);
      
      // Update last modified
      localStorage.setItem('sf_lastModified', new Date().toISOString());
    }

    // Update provider profile
    if (user?.role === 'provider') {
      const updatedProfile: ProviderProfile = {
        userId: user.id,
        zona,
        servicios,
        experiencia: parseInt(experiencia),
        descripcion,
        telefono,
        disponibilidad,
        perfilActivo,
        disponible: perfilActivo, // Keep backward compatibility
      };
      updateProviderProfile(updatedProfile);
    }
    
    setShowSuccess(true);
    setIsLoading(false);
    
    // Force UserMenu to re-render by triggering a custom event
    window.dispatchEvent(new Event('userUpdated'));
    
    // Auto-hide success toast after 4 seconds
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handlePasswordChange = async () => {
    setError('');
    setErrors({});

    const validationErrors: Record<string, string> = {};

    if (!currentPassword) {
      validationErrors.currentPassword = 'Ingresá tu contraseña actual';
    }

    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.valid) {
      validationErrors.newPassword = newPasswordValidation.message!;
    }

    if (newPassword !== confirmNewPassword) {
      validationErrors.confirmNewPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Mock password change (in real app, this would call backend)
    setSuccess('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const lastModified = localStorage.getItem('sf_lastModified');
  const formattedLastModified = lastModified 
    ? new Date(lastModified).toLocaleDateString('es-AR') 
    : accountCreated;

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
              <p className="font-bold text-lg">¡Cambios guardados!</p>
              <p className="text-sm text-green-100">Tu perfil se actualizó correctamente</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-200">
        <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </button>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SectionHeading title="Estado de cuenta" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo de cuenta</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.role === 'provider' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.role === 'provider' ? 'Prestador' : 'Cliente'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha de creación</p>
                  <p className="text-sm font-medium text-gray-700">{accountCreated}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Última actualización</p>
                  <p className="text-sm font-medium text-gray-700">{formattedLastModified}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionHeading title="Información personal" />

                {/* Avatar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl shadow-sm">
                      {avatar}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium text-gray-700"
                    >
                      <Camera className="w-4 h-4" />
                      Cambiar avatar
                    </button>
                  </div>

                  {showAvatarPicker && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Seleccioná un avatar:</p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setAvatar(emoji);
                              setShowAvatarPicker(false);
                            }}
                            className={`w-12 h-12 rounded-xl text-2xl hover:bg-white transition-colors border-2 ${
                              avatar === emoji ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    id="name"
                    label="Nombre"
                    value={name}
                    onChange={setName}
                    placeholder="Tu nombre"
                    error={errors.name}
                    icon={<User className="w-5 h-5" />}
                    required
                    disabled={isLoading}
                  />

                  <InputField
                    id="email"
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="tu@email.com"
                    icon={<Mail className="w-5 h-5" />}
                    disabled
                  />
                </div>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionHeading 
                  title="Seguridad" 
                  subtitle="Gestioná la seguridad de tu cuenta"
                />

                <div className="space-y-4 mb-6">
                  <InputField
                    id="currentPassword"
                    label="Contraseña actual"
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="••••••••"
                    error={errors.currentPassword}
                    icon={<Lock className="w-5 h-5" />}
                    disabled={isLoading}
                  />

                  <InputField
                    id="newPassword"
                    label="Nueva contraseña"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Mínimo 6 caracteres"
                    error={errors.newPassword}
                    icon={<Lock className="w-5 h-5" />}
                    disabled={isLoading}
                  />

                  <InputField
                    id="confirmNewPassword"
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    placeholder="••••••••"
                    error={errors.confirmNewPassword}
                    icon={<Lock className="w-5 h-5" />}
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isLoading || !currentPassword || !newPassword || !confirmNewPassword}
                    className="w-full md:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Cambiar contraseña
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>

              {/* Provider Profile Card */}
              {user.role === 'provider' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <SectionHeading 
                      title="Perfil profesional" 
                      subtitle="Información visible para clientes"
                    />
                    <Toggle
                      label="Perfil activo"
                      checked={perfilActivo}
                      onChange={setPerfilActivo}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-2">
                          Zona de trabajo <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="zona"
                          value={zona}
                          onChange={(e) => setZona(e.target.value)}
                          disabled={isLoading}
                          className={`w-full px-4 py-2.5 border-2 ${
                            errors.zona ? 'border-red-300' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 bg-gray-50 hover:bg-white`}
                        >
                          <option value="">Seleccioná una zona</option>
                          {ZONAS.map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </select>
                        {errors.zona && <p className="mt-1 text-sm text-red-600">{errors.zona}</p>}
                      </div>

                      <div>
                        <label htmlFor="disponibilidad" className="block text-sm font-medium text-gray-700 mb-2">
                          Disponibilidad
                        </label>
                        <select
                          id="disponibilidad"
                          value={disponibilidad}
                          onChange={(e) => setDisponibilidad(e.target.value)}
                          disabled={isLoading}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 bg-gray-50 hover:bg-white"
                        >
                          {DISPONIBILIDAD_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Servicios que prestás <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICIOS.map(servicio => (
                          <button
                            key={servicio}
                            type="button"
                            onClick={() => toggleServicio(servicio)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              servicios.includes(servicio)
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {servicio}
                          </button>
                        ))}
                      </div>
                      {errors.servicios && <p className="mt-1 text-sm text-red-600">{errors.servicios}</p>}
                    </div>

                    <InputField
                      id="experiencia"
                      label="Años de experiencia"
                      type="number"
                      value={experiencia}
                      onChange={setExperiencia}
                      placeholder="0"
                      error={errors.experiencia}
                      required
                      disabled={isLoading}
                    />

                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción profesional
                      </label>
                      <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none disabled:opacity-50 bg-gray-50 hover:bg-white"
                        placeholder="Contanos sobre tu experiencia y servicios..."
                      />
                    </div>

                    <InputField
                      id="telefono"
                      label="Teléfono de contacto"
                      value={telefono}
                      onChange={setTelefono}
                      placeholder="Ej: 11 1234-5678"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Save Button inside form */}
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
