import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Ticket, PlusCircle, QrCode, LogOut, Compass, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#2b55f5] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
              Pass<span className="text-[#2b55f5]">fy</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/home"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                isActive('/home')
                  ? 'bg-blue-50 text-[#2b55f5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/organizer/create')
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-purple-600" />
                    Publicar Evento
                  </span>
                </Link>
                <Link
                  to="/organizer/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/organizer/dashboard')
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Painel do Organizador
                </Link>
              </>
            )}

            {user?.role === 'CUSTOMER' && (
              <Link
                to="/my-tickets"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/my-tickets')
                    ? 'bg-blue-50 text-[#2b55f5] border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#2b55f5]" />
                  Meus Ingressos
                </span>
              </Link>
            )}

            {user?.role === 'GATEKEEPER' && (
              <Link
                to="/gatekeeper"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/gatekeeper')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
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
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition"
                >
                  Cadastre-se
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#2b55f5]"
          >
            Explorar Eventos
          </Link>
          {user?.role === 'ORGANIZER' && (
            <>
              <Link
                to="/organizer/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-purple-700 hover:text-purple-800"
              >
                Publicar Evento
              </Link>
              <Link
                to="/organizer/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#2b55f5]"
              >
                Painel do Organizador
              </Link>
            </>
          )}
          {user?.role === 'CUSTOMER' && (
            <Link
              to="/my-tickets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#2b55f5] hover:text-[#1f44d6]"
            >
              Meus Ingressos
            </Link>
          )}
          {user?.role === 'GATEKEEPER' && (
            <Link
              to="/gatekeeper"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
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
              className="w-full text-left py-2 text-sm text-rose-600 font-bold"
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
