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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {userAvatar}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/solicitudes');
            }}
            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Mis solicitudes</span>
          </button>

          {isProvider && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/inbox');
              }}
              className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Inbox className="w-4 h-4" />
              <span className="text-sm font-medium">Solicitudes recibidas</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Mi cuenta</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Configuración</span>
          </button>

          <div className="my-2 border-t border-gray-100"></div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};
