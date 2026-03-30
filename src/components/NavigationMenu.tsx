import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function SagoNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navItems = [
    { name: 'ABOUT', href: '/about' },
    // { name: 'CONTACT', href: '/contact' },
  ];

  return (
    <header className='fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 transition-all duration-500'>
      {/* Logo Pill */}
      <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-8 py-3 flex items-center transition-all duration-500 min-w-[200px] md:min-w-[450px] lg:min-w-[800px]'>
        <Link to='/' className='flex items-center space-x-3 group'>
          <div className='h-auto w-24 flex items-center justify-start text-background font-semibold text-sm group-hover:scale-105 transition-transform duration-200'>
            <img src='/sago-logo.png' alt='Sago Design Logo' className='h-8 w-auto' />
          </div>
        </Link>
      </div>

      {/* Desktop Nav Pill */}
      <nav className='hidden md:flex'>
        <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-6 py-3 flex items-center space-x-2 transition-all duration-500'>
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`font-semibold px-5 py-2 overflow-hidden ${location.pathname === item.href}`}
            >
              <span className='relative z-10'>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className='md:hidden relative flex justify-end'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 rounded-full transition-all duration-300 hover:scale-105'
            >
              <Menu className='h-4 w-4 text-primary' />
            </Button>
          </SheetTrigger>
          <SheetContent
            side='right'
            className='w-80 backdrop-blur-2xl rounded-2xl bg-background/95 border border-gray-400/30 shadow-2xl transition-all duration-500 ease-out fixed top-4 right-4 m-0 overflow-hidden [&>button]:hidden'
            style={{
              transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
              opacity: isOpen ? 1 : 0,
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              margin: 0,
              height: 'fit-content',
              maxHeight: 'calc(100vh - 2rem)',
            }}
          >
            <div className='flex flex-col pt-6 pb-6 max-h-[calc(100vh-2rem)] overflow-y-auto'>
              <div className='px-6 space-y-6'>
                <div className='space-y-1'>
                  {navItems.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className='flex pb-2 px-2 py-2 rounded-xl w-full transition-all duration-200 hover:text-primary hover:scale-105 focus:outline-none group animate-in slide-in-from-right bg-primary/10 hover:bg-primary/20'
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
