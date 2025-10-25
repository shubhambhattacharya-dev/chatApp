import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-base-100/95 backdrop-blur-xl border-b border-base-300/50 shadow-lg' 
          : 'bg-base-100/80 backdrop-blur-lg border-b border-base-300/20'
      } ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <div className="container mx-auto px-4 h-20">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-3 group transition-all duration-500 hover:scale-105"
            >
              <div
                className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80
                flex items-center justify-center shadow-lg shadow-primary/25
                transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/35
                group-hover:scale-110 group-hover:rotate-3 transform-gpu cursor-pointer group"
              >
                <MessageSquare className="size-7 text-white transition-transform duration-500 group-hover:scale-110" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                justChat
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className={`
                btn btn-sm gap-2 transition-all duration-300 transform
                ${isActivePath('/settings') 
                  ? 'btn-primary shadow-lg shadow-primary/25 scale-105' 
                  : 'btn-ghost hover:scale-105 hover:bg-base-300/50'}
                hover:shadow-md rounded-xl
                group relative overflow-hidden
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0 opacity-10`}></div>
              <Settings className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline font-medium">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link 
                  to="/profile" 
                  className={`
                    btn btn-sm gap-2 transition-all duration-300 transform
                    ${isActivePath('/profile') 
                      ? 'btn-primary shadow-lg shadow-primary/25 scale-105' 
                      : 'btn-ghost hover:scale-105 hover:bg-base-300/50'}
                    hover:shadow-md rounded-xl
                    group relative overflow-hidden
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0 opacity-10`}></div>
                  <User className="size-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                <button 
                  onClick={logout}
                  className="btn btn-sm btn-ghost gap-2 transition-all duration-300 
                  transform hover:scale-105 hover:bg-error/20 hover:text-error
                  rounded-xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-error/10 to-error/5 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0"></div>
                  <LogOut className="size-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-0.5" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Indicator Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 transform origin-left"
           style={{
             width: isScrolled ? '100%' : '0%',
             opacity: isScrolled ? 1 : 0
           }}
      ></div>
    </header>
  );
};

export default Navbar;