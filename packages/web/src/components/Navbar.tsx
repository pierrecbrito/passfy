import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Ticket, PlusCircle, QrCode, LogOut, Compass, Menu, X, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-surface-200/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              Pass<span className="text-brand-400">fy</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Explorar Eventos
              </span>
            </Link>

            {user?.role === 'ORGANIZER' && (
              <>
                <Link
                  to="/organizer/create"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/organizer/create')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-purple-400" />
                    Publicar Evento
                  </span>
                </Link>
                <Link
                  to="/organizer/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/organizer/dashboard')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Painel do Organizador
                </Link>
              </>
            )}

            {user?.role === 'CUSTOMER' && (
              <Link
                to="/my-tickets"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/my-tickets')
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-brand-400" />
                  Meus Ingressos
                </span>
              </Link>
            )}

            {user?.role === 'GATEKEEPER' && (
              <Link
                to="/gatekeeper"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/gatekeeper')
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Portaria / Scanner
                </span>
              </Link>
            )}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-slate-400 hover:text-rose-400"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Cadastre-se
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-surface-100 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Explorar Eventos
          </Link>
          {user?.role === 'ORGANIZER' && (
            <>
              <Link
                to="/organizer/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm text-purple-400 hover:text-purple-300"
              >
                Publicar Evento
              </Link>
              <Link
                to="/organizer/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-300 hover:text-white"
              >
                Painel do Organizador
              </Link>
            </>
          )}
          {user?.role === 'CUSTOMER' && (
            <Link
              to="/my-tickets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm text-brand-400 hover:text-brand-300"
            >
              Meus Ingressos
            </Link>
          )}
          {user?.role === 'GATEKEEPER' && (
            <Link
              to="/gatekeeper"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Portaria / Scanner
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
                navigate('/');
              }}
              className="w-full text-left py-2 text-sm text-rose-400 font-medium"
            >
              Sair da conta ({user.name})
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/register');
                }}
              >
                Cadastre-se
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
