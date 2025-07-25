import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SagoNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [workMenuOpen, setWorkMenuOpen] = useState(false);
  const [workMenuVisible, setWorkMenuVisible] = useState(false);
  const [menuAnimation, setMenuAnimation] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const projects = [
    { name: "Consultation Notice", href: "/projects/1" },
    { name: "Espacio Ideal", href: "/projects/2" },
    { name: "Wine Bottles", href: "/projects/3" },
    { name: "Burlington Co.", href: "/projects/4" },
    { name: "Autonomous Standing Desk", href: "/projects/5" },
    { name: "POSS Magazine", href: "/projects/6" },
    { name: "Run, Ride or Walk", href: "/projects/7" },
    { name: "Green Standards Toolkit", href: "/projects/8" },
    { name: "Tote Bag", href: "/projects/9" },
  ];

  const navItems = [
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  // Dropdown open/close with buffer
  function openWorkMenu() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setWorkMenuVisible(true);
    setTimeout(() => {
      setWorkMenuOpen(true);
      setMenuAnimation(true);
    }, 10); // allow mount before animating
  }
  function closeWorkMenu() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setWorkMenuOpen(false);
      setTimeout(() => {
        setWorkMenuVisible(false);
        setMenuAnimation(false);
      }, 250); // match animation duration
    }, 100); // 0.5s buffer
  }
  function cancelCloseWorkMenu() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(98vw,900px)] rounded-full shadow-xl bg-background/80 backdrop-blur-lg border border-gray-400/30 px-8 py-3 flex items-center justify-between space-x-6 transition-all duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="h-auto w-24 flex items-center justify-center text-background font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
          <img src="/sago-logo.png" alt="Sago Design Logo" className="h-8 w-auto" />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {/* Work with Modern Dropdown */}
        <div
          className="relative"
          onMouseEnter={openWorkMenu}
          onMouseLeave={closeWorkMenu}
        >
          <DropdownMenu open={workMenuOpen} onOpenChange={setWorkMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex items-center space-x-1 text-base font-semibold px-5 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors group overflow-hidden focus:outline-none shadow-none hover:shadow-primary/10 hover:shadow-lg"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={workMenuOpen}
                onFocus={openWorkMenu}
                onBlur={closeWorkMenu}
              >
                <span className="relative z-10 group-hover:text-primary transition-colors duration-200">WORK</span>
                <ChevronDown className="h-4 w-4 ml-1 group-hover:rotate-180 transition-transform duration-300" />
                {/* Animated underline */}
                <span className="absolute left-6 right-6 bottom-1 h-1 bg-primary/70 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
                {/* Soft glow on hover */}
                <span className="absolute inset-0 rounded-full pointer-events-none group-hover:shadow-[0_0_16px_4px_rgba(99,102,241,0.10)] transition-all duration-300" />
              </button>
            </DropdownMenuTrigger>
            {/* Animated Dropdown */}
            {workMenuVisible && (
              <div
                onMouseEnter={cancelCloseWorkMenu}
                onMouseLeave={closeWorkMenu}
                className={`w-64 mt-4 pt-4 rounded-2xl shadow-2xl border border-gray-400/30 bg-background/90 backdrop-blur-xl p-4 space-y-2 fixed left-1/2 -translate-x-1/2 z-50
                  transition-all duration-300
                  ${menuAnimation && workMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                `}
                style={{ top: '72px' }}
              >
                {projects.map((project) => (
                  <Link
                    key={project.href}
                    to={project.href}
                    className="flex items-center space-x-3 px-4 py-2 rounded-full w-full transition-all duration-200 bg-background/80 hover:bg-neutral-800/60 focus:bg-neutral-800/60 backdrop-blur-md
                      text-white hover:text-primary focus:text-primary
                      hover:scale-105 focus:scale-105 focus:outline-none"
                  >
                    <div className="h-5 w-5 flex items-center justify-center"><div className='h-2 w-2 rounded-full bg-primary/60'></div></div>
                    <span className="text-left w-full transition-all duration-200">{project.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </DropdownMenu>
        </div>

        {/* Other Navigation Items */}
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`text-base font-semibold px-4 py-2 rounded-full transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none ${
              location.pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 backdrop-blur-lg rounded-l-2xl">
            <div className="flex flex-col space-y-8 mt-8 pl-6">
              {/* Mobile Logo */}
              <div className="flex items-center space-x-3 pb-4">
                <div className="h-auto w-16 rounded-full bg-foreground flex items-center justify-center text-background font-semibold text-sm">
                  <img src="/sago-logo.png" alt="Sago Design Logo" />
                </div>
              </div>

              {/* Mobile Work Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-foreground">WORK</div>
                <div className="space-y-3 pl-4">
                  {projects.map((project) => (
                    <Link
                      key={project.href}
                      to={project.href}
                      className="block text-base text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {project.name}
                    </Link>
                  ))}
                  <Link
                    to="/work"
                    className="block text-base font-semibold text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>

              {/* Mobile Other Items */}
              <div className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-base font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
