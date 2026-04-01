import { Link, useLocation } from 'react-router-dom';

export default function SagoNavigation() {
  const location = useLocation();
  const navItems = [{ name: 'ABOUT', href: '/about' }];

  return (
    <header className='fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 transition-all duration-500'>
      {/* Logo Pill */}
      <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-8 py-3 flex items-center transition-all duration-500 min-w-[230px] md:min-w-[450px] lg:min-w-[800px]'>
        <Link to='/' className='flex items-center space-x-3 group'>
          <div className='h-auto w-24 flex items-center justify-start text-background font-semibold text-sm group-hover:scale-105 transition-transform duration-200'>
            <img src='/sago-logo.png' alt='Sago Design Logo' className='h-8 w-auto' />
          </div>
        </Link>
      </div>

      {/* Nav Pill — always visible */}
      <nav>
        <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-6 py-3 flex items-center space-x-2 transition-all duration-500'>
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`font-semibold px-5 py-2 overflow-hidden ${location.pathname === item.href ? 'text-primary' : ''}`}
            >
              <span className='relative z-10'>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
