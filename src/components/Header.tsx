import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 p-2.5 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ServiceFinder</h1>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
