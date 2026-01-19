import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="bg-blue-600 p-3 rounded-xl shadow-md">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold text-gray-900">
                ServiceFinder
              </h1>
              <p className="text-xs font-medium text-gray-500">Profesionales de confianza</p>
            </div>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
