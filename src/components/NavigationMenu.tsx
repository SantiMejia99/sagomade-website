import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SagoNavigation() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-border/40">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-auto w-25 bg-foreground flex items-center justify-center text-background font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
            <img src="/sago-logo.png" alt="Sago Design Logo" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {/* Work with Enhanced Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <span>WORK</span>
                <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-70 mt-1 backdrop-blur-xl border border-gray-400/30">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Projects
              </div>
              {projects.slice(0, 3).map((project) => (
                <DropdownMenuItem key={project.href} asChild>
                  <Link to={project.href} className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                      <span className="text-sm">{project.name}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <div className="my-2" />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                All Work
              </div>
              {projects.slice(0).map((project) => (
                <DropdownMenuItem key={project.href} asChild>
                  <Link to={project.href} className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40"></div>
                      <span className="text-sm">{project.name}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <div className="my-1" />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Other Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                location.pathname === item.href ? "text-foreground" : "text-muted-foreground"
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
            <SheetContent side="right" className="w-80 backdrop-blur-lg">
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
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {project.name}
                      </Link>
                    ))}
                    <Link
                      to="/work"
                      className="block text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
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
                      className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
      </div>
    </header>
  );
}
