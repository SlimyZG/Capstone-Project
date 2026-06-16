import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, BookOpen, AlertCircle, User, Award, Layers } from 'lucide-react';
import api from '../api';

interface RegisterProps {
  onLoginSuccess: (user: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [studentId, setStudentId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        setDepartments(response.data);
        if (response.data.length > 0) {
          setDepartmentId(response.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    if (password !== passwordConfirmation) {
      setErrors({ password: ['Passwords do not match.'] });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        student_id: studentId,
        department_id: departmentId,
      });

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);
      navigate('/student');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Registration failed. Please check your inputs and try again.'
        );
      }
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
            Join ConcernConnect
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
            Share feedback with your <span className="gradient-text">department</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Create an account to submit complaints, track updates, upvote peer concerns, and view real-time feedback status in your department.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Selective Isolation
              </h4>
              <p className="text-sm text-slate-400 mt-1">Submit concerns privately so they are hidden from other students.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span> Verified Identity
              </h4>
              <p className="text-sm text-slate-400 mt-1">Student ID validation prevents spam and ensures high accountability.</p>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-800/50 pt-6">
          <span>&copy; 2026 UniComplaints. All rights reserved.</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Student Conduct</a>
        </div>
      </div>

      {/* Right Panel: Form (40% width, full width on small screens) */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-12 xl:px-16 bg-slate-950 relative overflow-y-auto">
        {/* Glow effect for mobile */}
        <div className="lg:hidden absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mx-auto w-full max-w-md space-y-8 z-10 my-auto">
          <div className="lg:hidden flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Uni<span className="gradient-text">Complaints</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create student account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                sign in
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 px-6 py-8 shadow-2xl rounded-2xl sm:px-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {generalError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="form-error">{errors.name[0]}</p>}
              </div>

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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="john.doe@student.edu"
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="student_id" className="form-label">
                    Student ID
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Award className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    </div>
                    <input
                      id="student_id"
                      name="student_id"
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="form-input pl-10"
                      placeholder="2026-0001"
                    />
                  </div>
                  {errors.student_id && <p className="form-error">{errors.student_id[0]}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="department_id" className="form-label">
                    Department
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Layers className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    </div>
                    <select
                      id="department_id"
                      name="department_id"
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="form-select pl-10"
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.department_id && <p className="form-error">{errors.department_id[0]}</p>}
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Min 8 characters"
                  />
                </div>
                {errors.password && <p className="form-error">{errors.password[0]}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirmation" className="form-label">
                  Confirm Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="form-input pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center py-3 mt-2"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Create Student Account
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
              By signing up, you agree to our student code of conduct. To submit a complaint anonymously, you can toggle the privacy option within the complaint form.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
