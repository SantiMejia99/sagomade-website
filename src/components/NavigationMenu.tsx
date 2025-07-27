import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { 
  LuFileText, 
  LuType, 
  LuWine, 
  LuBeer, 
  LuMonitor, 
  LuBookOpen, 
  LuShirt, 
  LuLeaf, 
  LuShoppingBag 
} from "react-icons/lu";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function SagoNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [workMenuOpen, setWorkMenuOpen] = useState(false);
  const [workMenuVisible, setWorkMenuVisible] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const workMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const projects = [
    { name: "Consultation Notice", href: "/projects/1", icon: LuFileText },
    { name: "Espacio Ideal", href: "/projects/2", icon: LuType },
    { name: "Wine Bottles", href: "/projects/3", icon: LuWine },
    { name: "Burlington Co.", href: "/projects/4", icon: LuBeer },
    { name: "Autonomous Standing Desk", href: "/projects/5", icon: LuMonitor },
    { name: "POSS Magazine", href: "/projects/6", icon: LuBookOpen },
    { name: "Run, Ride or Walk", href: "/projects/7", icon: LuShirt },
    { name: "Green Standards Toolkit", href: "/projects/8", icon: LuLeaf },
    { name: "Tote Bag", href: "/projects/9", icon: LuShoppingBag },
  ];

  const navItems = [
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  // Dropdown open/close with buffer
  function openWorkMenu() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setWorkMenuVisible(true);
    setTimeout(() => {
      setWorkMenuOpen(true);
    }, 10);
  }
  
  function closeWorkMenu() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    closeTimeout.current = setTimeout(() => {
      setWorkMenuOpen(false);
      setTimeout(() => {
        setWorkMenuVisible(false);
      }, 400);
    }, 400);
  }
  
  function cancelCloseWorkMenu() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(98vw,900px)] transition-all duration-500">
      {/* Main Navigation Container */}
      <div className="rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-8 py-3 flex items-center justify-between space-x-2 transition-all duration-500">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-auto w-24 flex items-center justify-center text-background font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
            <img src="/sago-logo.png" alt="Sago Design Logo" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {/* Work with Expanding Dropdown */}
          <div
            ref={workMenuRef}
            className="relative"
            onMouseEnter={openWorkMenu}
            onMouseLeave={closeWorkMenu}
          >
            <button
              className={`relative flex items-center space-x-1 text-base font-semibold px-5 py-2 transition-all duration-300 group overflow-hidden focus:outline-none shadow-none hover:shadow-primary/10 hover:shadow-lg ${
                workMenuOpen 
                  ? 'bg-primary/20 text-primary rounded-t-full' 
                  : 'bg-primary/10 hover:bg-primary/20 rounded-full'
              }`}
              tabIndex={0}
              aria-haspopup="true"
              aria-expanded={workMenuOpen}
              onFocus={openWorkMenu}
              onBlur={closeWorkMenu}
              onMouseEnter={openWorkMenu}
              onMouseLeave={closeWorkMenu}
            >
              <span className="relative z-10 group-hover:text-primary transition-colors duration-300">WORK</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-300 ${workMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              {/* Animated underline */}
              <span className="absolute left-6 right-6 bottom-1 h-1 bg-primary/70 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
              {/* Soft glow on hover */}
              <span className="absolute inset-0 pointer-events-none group-hover:shadow-[0_0_16px_4px_rgba(99,102,241,0.10)] transition-all duration-300" />
            </button>

            {/* Expanding Dropdown Menu - Contained to WORK area */}
            {workMenuVisible && (
              <div
                onMouseEnter={cancelCloseWorkMenu}
                onMouseLeave={closeWorkMenu}
                className={`absolute top-full left-1/2 -translate-x-1/2 w-96 bg-background/95 backdrop-blur-2xl border border-gray-400/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 mt-6 ${
                  workMenuOpen 
                    ? 'opacity-100 max-h-[600px] translate-y-0' 
                    : 'opacity-0 max-h-0 -translate-y-2'
                }`}
              >
                <div className="p-6 pb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {projects.map((project) => {
                      const IconComponent = project.icon;
                      return (
                        <Link
                          key={project.href}
                          to={project.href}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl w-full transition-all duration-300 text-white hover:text-primary focus:text-primary hover:scale-105 focus:scale-105 focus:outline-none group"
                        >
                          <div className="h-7 w-7 flex items-center justify-center flex-shrink-0 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="h-3.5 w-3.5 text-black group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <span className="text-left w-full transition-all duration-300 font-medium text-xs truncate">{project.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-base font-semibold px-5 py-2 rounded-full transition-all duration-300 group overflow-hidden focus:outline-none shadow-none hover:shadow-primary/10 hover:shadow-lg ${
                location.pathname === item.href 
                  ? "bg-primary/20 text-primary" 
                  : "bg-primary/10 hover:bg-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="relative z-10 group-hover:text-primary transition-colors duration-300">{item.name}</span>
              {/* Animated underline */}
              <span className="absolute left-6 right-6 bottom-1 h-1 bg-primary/70 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
              {/* Soft glow on hover */}
              <span className="absolute inset-0 rounded-full pointer-events-none group-hover:shadow-[0_0_16px_4px_rgba(99,102,241,0.10)] transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden relative flex justify-end">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
                <Menu className="h-4 w-4 text-primary" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-80 backdrop-blur-2xl rounded-2xl bg-background/95 border border-gray-400/30 shadow-2xl transition-all duration-500 ease-out fixed top-4 right-4 m-0 overflow-hidden [&>button]:hidden"
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
              <div className="flex flex-col pt-6 pb-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="px-6 space-y-6">
                  {/* Mobile Work Section */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setMobileWorkOpen(!mobileWorkOpen)}
                      className="flex items-center justify-between w-full text-sm text-foreground font-semibold hover:text-primary transition-colors duration-300 group px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20"
                    >
                      <span>WORK</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileWorkOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${mobileWorkOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="grid grid-cols-1 gap-3 pl-4">
                        {projects.map((project, index) => {
                          const IconComponent = project.icon;
                          return (
                            <Link
                              key={project.href}
                              to={project.href}
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full transition-all duration-300 text-muted-foreground hover:text-primary hover:scale-105 focus:outline-none group animate-in slide-in-from-right bg-primary/10 hover:bg-primary/20"
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="h-7 w-7 flex items-center justify-center flex-shrink-0 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="h-3.5 w-3.5 text-black group-hover:scale-110 transition-transform duration-300" />
                              </div>
                              <span className="text-left w-full transition-all duration-300 font-medium text-sm">{project.name}</span>
                            </Link>
                          );
                        })}
                        <Link
                          to="/work"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full transition-all duration-300 text-primary hover:text-primary/80 hover:scale-105 focus:outline-none group font-semibold animate-in slide-in-from-right bg-primary/10 hover:bg-primary/20"
                          style={{ animationDelay: `${projects.length * 50}ms` }}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="h-7 w-7 flex items-center justify-center flex-shrink-0 bg-primary/20 rounded-full">
                            <span className="text-xs font-bold">ALL</span>
                          </div>
                          <span className="text-left w-full transition-all duration-300 font-medium text-sm">View All Work</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mobile About & Contact */}
                  <div className="space-y-4">
                    {navItems.map((item, index) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center justify-between w-full text-sm text-foreground font-semibold hover:text-primary transition-colors duration-300 group px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 animate-in slide-in-from-right"
                        style={{ animationDelay: `${(projects.length + 1 + index) * 50}ms` }}
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
      </div>
    </header>
  );
}
