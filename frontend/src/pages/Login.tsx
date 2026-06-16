import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, BookOpen, AlertCircle } from 'lucide-react';
import api from '../api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Fetch CSRF cookie if using stateful session auth (optional but recommended for Laravel)
      // await api.get('/sanctum/csrf-cookie');
      
      // 2. Perform Login
      const response = await api.post('/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'department') {
        navigate('/department');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Invalid login credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel: Hero & Illustration (60% width, hidden on small screens) */}
      <div className="hidden lg:flex lg:w-3/5 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]"></div>

        {/* Top: Logo */}
        <div className="flex items-center gap-3 z-10">
          <BookOpen className="h-9 w-9 text-indigo-500" />
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Uni<span className="gradient-text">Complaints</span>
          </span>
        </div>

        {/* Middle: Content/Illustration */}
        <div className="my-auto z-10 max-w-xl space-y-6">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-indigo-300 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            Campus Feedback System
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
            Bridging the gap between <span className="gradient-text">students</span> and <span className="text-purple-400">departments</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Submit, track, and resolve campus concerns in a transparent, structured, and efficient feedback environment.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Priority Queuing
              </h4>
              <p className="text-sm text-slate-400 mt-1">Urgent matters are automatically escalated for quick resolution.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span> AI Insights
              </h4>
              <p className="text-sm text-slate-400 mt-1">Sentiment analysis helps staff categorize and process feedback.</p>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-800/50 pt-6">
          <span>&copy; 2026 UniComplaints. All rights reserved.</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Support Portal</a>
        </div>
      </div>

      {/* Right Panel: Form (40% width, full width on small screens) */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-16 bg-slate-950 relative">
        {/* Glow effect for mobile */}
        <div className="lg:hidden absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mx-auto w-full max-w-md space-y-8 z-10">
          <div className="lg:hidden flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Uni<span className="gradient-text">Complaints</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Or{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                create a student account
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 px-6 py-8 shadow-2xl rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="name@school.edu"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center py-3"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
              Complaints system handles department concerns and resolutions. Note that Department and Admin accounts must be created by the system administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
