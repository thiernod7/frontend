import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: '🏠' },
  { name: 'Élèves', href: '/students', icon: '🎓' },
  { name: 'Classes', href: '/classes', icon: '📅' },
  { name: 'Finance', href: '/finance', icon: '💰' },
  { name: 'Documents', href: '/documents', icon: '📄' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow pt-20 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
                {isActive && (
                  <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer de la sidebar */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            École Management v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
