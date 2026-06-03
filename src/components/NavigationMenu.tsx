import { useLocation, useNavigate } from 'react-router-dom';
import { transitionRef } from './transitionRef';

export default function SagoNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [{ name: 'ABOUT', href: '/about' }];

  const goTo = (path: string) => {
    transitionRef.current?.navigate(() => navigate(path), '#0d0d0d');
  };

  return (
    <header className='fixed top-4 lg:top-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 transition-all duration-500'>
      {/* Logo Pill */}
      <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-6 lg:px-8 py-3 flex items-start justify-center md:justify-start transition-all duration-500 min-w-[100px] lg:min-w-[800px]'>
        <button onClick={() => goTo('/')} className='flex group cursor-pointer'>
          <div className='h-auto w-24 flex text-background group-hover:scale-105 transition-transform duration-200'>
            <img src='/sago-logo.png' alt='Sago Design Logo' className='h-8 w-auto' />
          </div>
        </button>
      </div>

      {/* Nav Pill */}
      <nav>
        <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-6 lg:px-8 py-3 flex items-center space-x-2 transition-all duration-500'>
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => goTo(item.href)}
              className={`font-semibold px-5 py-2 overflow-hidden cursor-pointer ${location.pathname === item.href ? 'text-primary' : ''}`}
            >
              <span className='relative z-10'>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
