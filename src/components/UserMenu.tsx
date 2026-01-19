import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut, FileText, Inbox } from 'lucide-react';
import { clearSession, getCurrentUserName, getUser } from '../lib/auth';

export const UserMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState(getCurrentUserName());
  const [userAvatar, setUserAvatar] = useState(getUser()?.avatar || '👤');
  const [isProvider, setIsProvider] = useState(getUser()?.role === 'provider');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleStorageChange = () => {
      setUserName(getCurrentUserName());
      setUserAvatar(getUser()?.avatar || '👤');
    };

    const handleUserUpdate = () => {
      setUserName(getCurrentUserName());
      setUserAvatar(getUser()?.avatar || '👤');
      setIsProvider(getUser()?.role === 'provider');
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border-2 border-transparent hover:border-blue-100 hover:shadow-md"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-50"></div>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center text-white font-bold text-base shadow-lg">
            {userAvatar}
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-800 hidden sm:block">{userName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <p className="text-base font-bold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-600 mt-0.5">{isProvider ? 'Profesional' : 'Cliente'}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/solicitudes');
            }}
            className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700 hover:text-blue-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100 flex items-center justify-center transition-all">
              <FileText className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold">Mis solicitudes</span>
          </button>

          {isProvider && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/inbox');
              }}
              className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 flex items-center justify-center transition-all">
                <Inbox className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
              </div>
              <span className="text-sm font-semibold">Solicitudes recibidas</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700 hover:text-blue-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100 flex items-center justify-center transition-all">
              <User className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold">Mi cuenta</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700 hover:text-gray-900 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-gray-100 group-hover:to-gray-200 flex items-center justify-center transition-all">
              <Settings className="w-4 h-4 group-hover:text-gray-700 transition-colors" />
            </div>
            <span className="text-sm font-semibold">Configuración</span>
          </button>

          <div className="my-2 border-t border-gray-200"></div>

          <button
            onClick={handleLogout}
            className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-red-600 hover:text-red-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-pink-100 flex items-center justify-center transition-all">
              <LogOut className="w-4 h-4 group-hover:text-red-700 transition-colors" />
            </div>
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};
