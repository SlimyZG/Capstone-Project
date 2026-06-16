import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Award, User as UserIcon, BookOpen } from 'lucide-react';
import api from '../api';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      onLogout();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500 animate-pulse-dot" />
            <span className="text-xl font-bold tracking-tight text-white">
              Uni<span className="gradient-text">Complaints</span>
            </span>
          </div>

          {/* User actions and profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-100">{user.name}</span>
              <div className="flex items-center gap-1.5 justify-end">
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {user.role === 'department' && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Award className="h-3 w-3" /> Dept: {user.department?.name || 'Staff'}
                  </span>
                )}
                {user.role === 'student' && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    <UserIcon className="h-3 w-3" /> Student
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/60 hover:border-rose-500/30 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-rose-400 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
