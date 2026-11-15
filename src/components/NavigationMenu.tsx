import { useLocation, useNavigate } from 'react-router-dom';
import { transitionRef } from './transitionRef';
import { VOID } from './playground/void-config';

// On the home route the nav sits on the grid's curved CRT glass. A true barrel would bend it into a slight arch, but
// filtering the pills with a displacement map bends only their contents, not their backdrop-blurred glass (a visible
// double edge), so this approximates the curvature with a real transform instead: a small shrink plus a tilt with the
// top receding. Blur and hit-testing stay exact. Strength follows the grid's k (VOID.crt).
const crt = VOID.crt.k * VOID.crt.navStrength;
// index.css gives every button a #0d0d0d background (unlayered, so Tailwind's bg-transparent cannot override it);
// inside the glass pills that shows as a dark box, so the nav's own buttons clear it inline.
const CLEAR_BUTTON = { backgroundColor: 'transparent' } as const;
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4efe9]';

const HOME_NAV_TRANSFORM = `perspective(1000px) rotateX(${(40 * crt).toFixed(2)}deg) scale(${(1 - 0.3 * crt).toFixed(4)})`;

export default function SagoNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [{ name: 'ABOUT', href: '/about' }];

  const goTo = (path: string) => {
    transitionRef.current?.navigate(() => navigate(path), '#0d0d0d');
  };

  return (
    <header
      className='fixed top-4 lg:top-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 transition-all duration-500'
      style={{ transform: location.pathname === '/' ? HOME_NAV_TRANSFORM : undefined }}
    >
      {/* Logo Pill */}
      <div className='rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-6 lg:px-8 py-3 flex items-start justify-center md:justify-start transition-all duration-500 min-w-[100px] lg:min-w-[800px]'>
        <button
          onClick={() => goTo('/')}
          className={`flex group cursor-pointer rounded-full ${FOCUS_RING}`}
          style={CLEAR_BUTTON}
        >
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
              className={`font-semibold px-5 py-2 overflow-hidden cursor-pointer rounded-full transition-opacity duration-200 hover:opacity-70 ${FOCUS_RING} ${location.pathname === item.href ? 'text-primary' : ''}`}
              style={CLEAR_BUTTON}
            >
              <span className='relative z-10'>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
