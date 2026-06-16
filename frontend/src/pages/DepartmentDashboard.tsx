import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Calendar, Paperclip, AlertCircle, RefreshCw, X, Eye, 
  User, UserCheck, Inbox, ShieldAlert, CheckCircle2, ChevronRight, Send,
  LayoutDashboard, LogOut, Building2, Key, Lock, Shield, Award
} from 'lucide-react';
import api from '../api';

const DepartmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Tabs: 'dashboard' | 'profile'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

  // User details
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Complaints & statuses state
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Complaint / Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [viewingDetail, setViewingDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Respond State
  const [responseBody, setResponseBody] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setFullName(res.data.name || '');
      setEmail(res.data.email || '');
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus ? `/department/dashboard?status=${filterStatus}` : '/department/dashboard';
      const res = await api.get(url);
      setComplaints(res.data.complaints?.data || res.data.complaints || []);
      setStatuses(res.data.statuses || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load department complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchComplaints();
  }, [filterStatus]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleViewDetails = async (complaint: any) => {
    setViewingDetail(true);
    setLoadingDetail(true);
    setSuccessMsg(null);
    try {
      const res = await api.get(`/department/complaints/${complaint.id}`);
      setSelectedComplaint(res.data);
    } catch (err) {
      console.error(err);
      setSelectedComplaint(complaint);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    setSuccessMsg(null);
    try {
      const res = await api.patch(`/department/complaints/${selectedComplaint.id}/status`, {
        status: newStatus
      });
      setSuccessMsg(res.data.message);
      
      setSelectedComplaint((prev: any) => ({
        ...prev,
        status: newStatus
      }));

      setComplaints(prev => prev.map(c => {
        if (c.id === selectedComplaint.id) {
          return { ...c, status: newStatus };
        }
        return c;
      }));
    } catch (err: any) {
      console.error(err);
      setError('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !responseBody.trim()) return;
    
    setSubmittingResponse(true);
    setSuccessMsg(null);
    try {
      const res = await api.post(`/department/complaints/${selectedComplaint.id}/respond`, {
        body: responseBody
      });
      setSuccessMsg(res.data.message);
      
      setSelectedComplaint((prev: any) => ({
        ...prev,
        responses: [...(prev.responses || []), res.data.response]
      }));

      setResponseBody('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to post response. Make sure it is at least 5 characters.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    if (password && password !== passwordConfirmation) {
      setProfileError('Passwords do not match.');
      setProfileLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: fullName,
        email: email,
      };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }

      await api.put('/profile', payload);
      setProfileSuccess('Profile updated successfully!');
      
      // Update local storage user state
      const updatedUser = { ...user, name: fullName, email: email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setPassword('');
      setPasswordConfirmation('');
      fetchUser(); // reload relationships
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        setProfileError(firstError[0]);
      } else {
        setProfileError(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Priority Queue Scoring & Badges
  const getPriorityScore = (c: any) => {
    return (c.upvotes_count || 0) * 2 + (c.status === 'pending' ? 3 : 0);
  };

  const getPriorityBadge = (c: any) => {
    const score = getPriorityScore(c);
    if (score > 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          High ({score})
        </span>
      );
    } else if (score >= 5) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Medium ({score})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Low ({score})
        </span>
      );
    }
  };

  // AI Sentiment Inference
  const getSentiment = (body: string) => {
    const text = (body || '').toLowerCase();
    const negativeKeywords = ['angry', 'frustrated', 'unacceptable', 'terrible', 'demand', 'broken', 'awful', 'disappointed', 'hate', 'worst', 'poor', 'bad', 'sucks', 'fail', 'failure', 'useless'];
    const urgentKeywords = ['please', 'urgent', 'help', 'safety', 'health', 'danger', 'emergency', 'injured', 'accident', 'immediate', 'hazard', 'crisis', 'injury'];
    
    const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));
    const hasUrgent = urgentKeywords.some(keyword => text.includes(keyword));
    
    if (hasNegative) {
      return {
        label: 'Negative',
        style: 'bg-red-500/10 text-red-500 border border-red-500/20'
      };
    } else if (hasUrgent) {
      return {
        label: 'Urgent',
        style: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
      };
    } else {
      return {
        label: 'Neutral',
        style: 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'investigating': return 'badge-investigating';
      case 'resolved': return 'badge-resolved';
      default: return 'badge-closed';
    }
  };

  // Sort complaints by priority score descending
  const sortedComplaints = [...complaints].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Complaints Queue';
      case 'profile': return 'Staff Profile';
      default: return 'Complaints Queue';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-850 font-sans">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 bg-[#0D1527] text-slate-400 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo Heading */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
            <div className="bg-amber-600 p-2.5 rounded-xl text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">ConcernConnect</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Staff Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1 px-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800/40 text-white border-amber-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-800/40 text-white border-amber-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800/40 space-y-4">
          <div className="flex flex-col gap-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-xs font-bold text-white truncate">{user?.name}</span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase truncate">
              {user?.department?.name || 'Department Staff'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTAINER ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ─── TOP HEADER ─── */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">{getTabTitle()}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Department: <strong className="text-slate-700">{user?.department?.name || 'Loading...'}</strong>
            </span>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="p-10 flex-1 overflow-y-auto">
          
          {/* ────────────────── DASHBOARD TAB ────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Sorted Queue</span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select bg-slate-50 border-slate-200 text-slate-700 text-xs py-2 px-3.5 rounded-xl outline-none"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>

                  <button
                    onClick={fetchComplaints}
                    disabled={loading}
                    className="btn-outline p-2 rounded-xl text-slate-400 hover:text-indigo-600 bg-slate-50 border-slate-200"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Complaints Data Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
                  <p className="text-sm text-slate-500">Loading complaints queue...</p>
                </div>
              ) : sortedComplaints.length === 0 ? (
                <div className="card card-body empty-state border-slate-100 bg-white shadow-sm p-12 text-center flex flex-col items-center rounded-3xl">
                  <div className="empty-state-icon bg-slate-100 p-4 rounded-full text-slate-400 mb-3">
                    <Inbox className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Queue is Empty</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    {filterStatus ? `No complaints match "${filterStatus}" filter.` : 'No concerns have been submitted to your department.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Priority</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Concern</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Sentiment</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Submitter</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Received</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Upvotes</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedComplaints.map((c) => {
                          const sentiment = getSentiment(c.body);
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4.5">
                                {getPriorityBadge(c)}
                              </td>
                              <td className="px-6 py-4.5 max-w-xs">
                                <div className="font-bold text-slate-800 truncate">{c.title}</div>
                                <div className="text-slate-400 text-xs truncate mt-0.5">{c.body}</div>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sentiment.style}`}>
                                  {sentiment.label}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                  {c.is_anonymous ? (
                                    <>
                                      <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
                                      <span className="font-semibold text-slate-500 italic">Anonymous</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                                      <span className="font-semibold text-slate-700">{c.user?.name || 'Student'}</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className="text-xs text-slate-500 font-medium">
                                  {new Date(c.created_at).toLocaleDateString(undefined, { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                  })}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                                  {c.upvotes_count || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={getStatusBadge(c.status)}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <button
                                  onClick={() => handleViewDetails(c)}
                                  className="btn-primary btn-sm py-1.5 px-3 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                                >
                                  Manage <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── PROFILE TAB ────────────────── */}
          {activeTab === 'profile' && (
            <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl shadow-lg grid grid-cols-12 overflow-hidden mx-auto">
              {/* Left Section (Dark Info) */}
              <div className="col-span-12 md:col-span-5 bg-[#0D1527] text-white p-8 flex flex-col justify-between min-h-[400px] relative">
                <div className="absolute bottom-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-4">
                  <div className="bg-amber-600 p-3 rounded-2xl w-fit text-white shadow-md">
                    <User className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold tracking-wide">Staff Settings</h4>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                    Update your official staff details, security credentials, and department configurations.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-amber-400 mt-6 border-t border-slate-800/60 pt-6">
                  <Award className="h-5 w-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    {user?.department?.name || 'Verified Staff'}
                  </span>
                </div>
              </div>

              {/* Right Section (Form) */}
              <div className="col-span-12 md:col-span-7 p-8 space-y-6">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {profileSuccess && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold animate-fade-up">
                      {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm animate-fade-up">
                      {profileError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Staff Representative"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Email</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <UserCheck className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@school.edu"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Department (Read Only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Assignment (Read Only)</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={user?.department?.name || 'Department Staff'}
                        className="w-full bg-slate-100/80 border border-slate-200 text-slate-500 rounded-xl py-3 px-10 outline-none text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-4"></div>

                  {/* Password Controls */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      <span>Security Settings (Leave blank to keep current)</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Key className="h-4.5 w-4.5" />
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Key className="h-4.5 w-4.5" />
                          </div>
                          <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFullName(user?.name || '');
                        setEmail(user?.email || '');
                        setPassword('');
                        setPasswordConfirmation('');
                        setActiveTab('dashboard');
                      }}
                      className="text-slate-500 hover:text-slate-700 font-bold text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      {profileLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span>Save Changes</span>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── DETAILS & ACTIONS MODAL ─── */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative card w-full max-w-2xl bg-white border border-slate-150 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Manage Campus Concern</h3>
                <p className="text-xs text-slate-400 mt-0.5">Complaint Reference ID: #{selectedComplaint?.id || ''}</p>
              </div>
              <button 
                onClick={() => { setViewingDetail(false); setSelectedComplaint(null); setSuccessMsg(null); }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail || !selectedComplaint ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
                <p className="text-sm text-slate-400">Loading details...</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Meta Badges Container */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  <span className={getStatusBadge(selectedComplaint.status)}>
                    Status: {selectedComplaint.status.toUpperCase()}
                  </span>

                  {/* Priority Badge */}
                  {getPriorityBadge(selectedComplaint)}

                  {/* AI Sentiment Badge */}
                  {(() => {
                    const sentiment = getSentiment(selectedComplaint.body);
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${sentiment.style}`}>
                        AI Sentiment: {sentiment.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Status Update Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Actionable Status</p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">Modify progress state below</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedComplaint.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="form-select bg-white border border-slate-200 py-1.5 px-3 text-xs text-slate-700 rounded-xl w-36 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {successMsg && (
                  <div className="rounded-xl border border-emerald-250 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                    {successMsg}
                  </div>
                )}

                {/* Complaint Info */}
                <div className="space-y-2.5">
                  <h2 className="text-lg font-bold text-slate-800">{selectedComplaint.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-5 rounded-2xl whitespace-pre-line shadow-inner">
                    {selectedComplaint.body}
                  </p>
                </div>

                {/* Submitter & Date */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="flex items-center gap-2">
                    {selectedComplaint.is_anonymous ? (
                      <>
                        <Shield className="h-4.5 w-4.5 text-slate-400" />
                        <span className="font-semibold text-slate-500">Anonymous (Privacy Checkbox Enabled)</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4.5 w-4.5 text-indigo-500" />
                        <span className="text-slate-700 font-semibold">
                          {selectedComplaint.user?.name} (ID: {selectedComplaint.user?.student_id || 'N/A'}) - {selectedComplaint.user?.email}
                        </span>
                      </>
                    )}
                  </span>
                  
                  <span className="flex items-center gap-1.5 ml-auto text-slate-400 font-medium">
                    <Calendar className="h-4 w-4" />
                    Received: {new Date(selectedComplaint.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Evidence File */}
                {selectedComplaint.attachment_path && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 font-bold">Attached Document/Evidence</span>
                    </div>
                    <a 
                      href={`http://127.0.0.1:8000/storage/${selectedComplaint.attachment_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-outline btn-sm text-xs py-1.5 px-3 rounded-xl bg-white flex items-center gap-1 border-slate-200 text-slate-600 hover:text-indigo-600"
                    >
                      <Eye className="h-3.5 w-3.5" /> View File
                    </a>
                  </div>
                )}

                <div className="h-px bg-slate-100"></div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-amber-500" />
                    Responses ({selectedComplaint.responses?.length || 0})
                  </h4>

                  {!selectedComplaint.responses || selectedComplaint.responses.length === 0 ? (
                    <p className="p-5 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold italic border border-slate-100">
                      No response has been added to this complaint yet. Provide updates below to notify the student.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-56 overflow-y-auto pr-2">
                      {selectedComplaint.responses.map((response: any) => (
                        <div key={response.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span className="text-amber-600">{response.user?.name} (Dept Representative)</span>
                            <span>{new Date(response.created_at).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium">{response.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Write Response Form */}
                <form onSubmit={handleSendResponse} className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Post Official Response Update</label>
                    <textarea
                      required
                      value={responseBody}
                      onChange={(e) => setResponseBody(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-2xl py-3 px-4 outline-none transition-all duration-150 text-xs shadow-inner min-h-[90px] resize-none"
                      placeholder="Type details or action plans regarding this complaint..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingResponse || !responseBody.trim()}
                      className="btn-primary py-2 px-5 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700"
                    >
                      {submittingResponse ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Post Update
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentDashboard;
