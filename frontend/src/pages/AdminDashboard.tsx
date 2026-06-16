import React, { useState, useEffect } from 'react';
import {
  Users, MessageSquare, CheckCircle2, Clock, BarChart3,
  UserPlus, Trash2, Search, RefreshCw, AlertCircle, Shield,
  Award, X, Plus, Eye, Lock
} from 'lucide-react';
import api from '../api';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'users' | 'profile'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form State
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Complaint filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    role: 'student', department_id: ''
  });
  const [createUserErrors, setCreateUserErrors] = useState<Record<string, string[]>>({});
  const [creatingUser, setCreatingUser] = useState(false);

  // ------- DATA FETCHING -------
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
      setRecentComplaints(res.data.recent_complaints || []);
      setDeptStats(res.data.department_stats || []);
    } catch (err: any) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterDept) params.set('department_id', filterDept);
      if (searchQuery) params.set('search', searchQuery);
      const res = await api.get(`/admin/complaints?${params}`);
      setComplaints(res.data.complaints?.data || []);
      if (!departments.length && res.data.departments) setDepartments(res.data.departments);
    } catch (err) {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole) params.set('role', filterRole);
      if (userSearch) params.set('search', userSearch);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users?.data || []);
      if (!departments.length && res.data.departments) setDepartments(res.data.departments);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setFullName(res.data.name || '');
      setEmail(res.data.email || '');
    } catch (err) {
      console.error('Failed to fetch admin user:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
    else if (activeTab === 'complaints') fetchComplaints();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

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
      
      const updatedUser = { ...user, name: fullName, email: email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setPassword('');
      setPasswordConfirmation('');
      fetchUser();
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

  // ------- ACTIONS -------
  const handleViewComplaint = async (complaint: any) => {
    try {
      const res = await api.get(`/admin/complaints/${complaint.id}`);
      setSelectedComplaint(res.data.complaint);
      if (!departments.length && res.data.departments) setDepartments(res.data.departments);
    } catch {
      setSelectedComplaint(complaint);
    }
    setShowComplaintModal(true);
  };

  const handleReassignComplaint = async (deptId: string) => {
    if (!selectedComplaint) return;
    try {
      await api.patch(`/admin/complaints/${selectedComplaint.id}/reassign`, { department_id: deptId });
      setSuccessMsg('Complaint reassigned successfully.');
      setSelectedComplaint((prev: any) => ({ ...prev, department_id: parseInt(deptId) }));
      fetchComplaints();
    } catch {
      setError('Failed to reassign complaint.');
    }
  };

  const handleOverrideStatus = async (status: string) => {
    if (!selectedComplaint) return;
    try {
      await api.patch(`/admin/complaints/${selectedComplaint.id}/status`, { status });
      setSuccessMsg('Status overridden successfully.');
      setSelectedComplaint((prev: any) => ({ ...prev, status }));
      fetchComplaints();
    } catch {
      setError('Failed to override status.');
    }
  };

  const handleDeleteComplaint = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;
    try {
      await api.delete(`/admin/complaints/${id}`);
      setSuccessMsg('Complaint deleted.');
      setShowComplaintModal(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch {
      setError('Failed to delete complaint.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccessMsg('User deleted.');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserErrors({});
    setCreatingUser(true);
    try {
      await api.post('/admin/users', newUser);
      setSuccessMsg('User created successfully!');
      setShowCreateUserModal(false);
      setNewUser({ name: '', email: '', password: '', password_confirmation: '', role: 'student', department_id: '' });
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setCreateUserErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Failed to create user.');
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'investigating': return 'badge-investigating';
      case 'resolved': return 'badge-resolved';
      default: return 'badge-closed';
    }
  };

  const TABS = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'profile', label: 'Profile', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setError(null); setSuccessMsg(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === 'dashboard' && (
        loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : stats ? (
          <div className="space-y-8 stagger">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
              {[
                { label: 'Total Complaints', value: stats.total_complaints, icon: MessageSquare, color: 'text-slate-300' },
                { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-rose-400' },
                { label: 'Investigating', value: stats.investigating, icon: Eye, color: 'text-amber-400' },
                { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-400' },
              ].map((stat) => (
                <div key={stat.label} className="stat-card border-slate-800 bg-slate-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-label">{stat.label}</span>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className={`stat-value ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Complaints */}
              <div className="card border-slate-800 bg-slate-900/30">
                <div className="card-body pb-0">
                  <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-400" /> Recent Complaints
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Dept</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.map((c) => (
                        <tr key={c.id}>
                          <td className="font-medium text-slate-200 max-w-[160px] truncate">{c.title}</td>
                          <td className="text-xs text-slate-400">{c.department?.name}</td>
                          <td><span className={getBadgeClass(c.status)}>{c.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dept Stats */}
              <div className="card border-slate-800 bg-slate-900/30 card-body">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-400" /> Department Workload
                </h3>
                <div className="space-y-3">
                  {deptStats.map((d) => {
                    const pct = stats.total_complaints > 0 
                      ? Math.round((d.complaints_count / stats.total_complaints) * 100) 
                      : 0;
                    return (
                      <div key={d.id}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-300 font-medium">{d.name}</span>
                          <span className="text-slate-500 text-xs">{d.complaints_count} complaints ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* ===== COMPLAINTS TAB ===== */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                placeholder="Search complaints..."
                className="form-input pl-9 py-2 text-sm rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); }}
              className="form-select py-2 text-sm rounded-lg bg-slate-900 border-slate-800 text-slate-100 w-36"
            >
              <option value="">All Status</option>
              {['pending','investigating','resolved','closed'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); }}
              className="form-select py-2 text-sm rounded-lg bg-slate-900 border-slate-800 text-slate-100 w-44"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button onClick={fetchComplaints} disabled={loading} className="btn-outline p-2.5 rounded-lg shrink-0">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
          ) : (
            <div className="card border-slate-800 bg-slate-900/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Complaint</th>
                      <th>Submitter</th>
                      <th>Dept</th>
                      <th>Status</th>
                      <th>Upvotes</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-slate-500">No complaints found</td></tr>
                    ) : complaints.map((c) => (
                      <tr key={c.id}>
                        <td className="text-slate-500 text-xs font-mono">{c.id}</td>
                        <td className="max-w-[200px]">
                          <div className="font-semibold text-slate-100 truncate">{c.title}</div>
                        </td>
                        <td>
                          {c.is_anonymous ? (
                            <span className="text-slate-500 text-xs italic">Anonymous</span>
                          ) : (
                            <span className="text-xs text-slate-300">{c.user?.name}</span>
                          )}
                        </td>
                        <td><span className="text-xs text-slate-400">{c.department?.name}</span></td>
                        <td><span className={getBadgeClass(c.status)}>{c.status}</span></td>
                        <td><span className="text-xs text-slate-400">{c.upvotes_count || 0}</span></td>
                        <td className="text-right">
                          <div className="flex justify-end items-center gap-1">
                            <button onClick={() => handleViewComplaint(c)} className="btn-outline btn-sm py-1 px-2 flex items-center gap-1 cursor-pointer">
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button onClick={() => handleDeleteComplaint(c.id)} className="btn-danger btn-sm py-1 px-2 flex items-center gap-1 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Search by name or email..."
                className="form-input pl-9 py-2 text-sm rounded-lg"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); }}
              className="form-select py-2 text-sm rounded-lg bg-slate-900 border-slate-800 text-slate-100 w-36"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="department">Departments</option>
            </select>
            <button onClick={fetchUsers} disabled={loading} className="btn-outline p-2.5 rounded-lg shrink-0">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setShowCreateUserModal(true); setCreateUserErrors({}); }}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Create User
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
          ) : (
            <div className="card border-slate-800 bg-slate-900/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Registered</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-500">No users found</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id}>
                        <td className="font-semibold text-slate-100">{u.name}</td>
                        <td className="text-xs text-slate-400">{u.email}</td>
                        <td>
                          {u.role === 'department' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Award className="h-3 w-3" /> Dept
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                              <Shield className="h-3 w-3" /> Student
                            </span>
                          )}
                        </td>
                        <td className="text-xs text-slate-400">{u.department?.name || '—'}</td>
                        <td className="text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn-danger btn-sm py-1 px-2 flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== COMPLAINT DETAIL MODAL ===== */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative card w-full max-w-2xl bg-slate-900 border-slate-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Admin: Manage Complaint #{selectedComplaint.id}</h3>
              <button onClick={() => { setShowComplaintModal(false); setSelectedComplaint(null); setSuccessMsg(null); }}
                className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedComplaint.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl border border-slate-800/60 bg-slate-850/30 whitespace-pre-line">{selectedComplaint.body}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/20">
                  <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">Override Status</p>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleOverrideStatus(e.target.value)}
                    className="form-select bg-slate-900 border-slate-700 py-1.5 px-2.5 text-xs text-slate-100 rounded-lg w-full"
                  >
                    {['pending','investigating','resolved','closed'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/20">
                  <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">Reassign to Dept</p>
                  <select
                    value={selectedComplaint.department_id || ''}
                    onChange={(e) => handleReassignComplaint(e.target.value)}
                    className="form-select bg-slate-900 border-slate-700 py-1.5 px-2.5 text-xs text-slate-100 rounded-lg w-full"
                  >
                    <option value="" disabled>Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-4">
                <button
                  onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                  className="btn-danger flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE USER MODAL ===== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative card w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" /> Create New User
              </h3>
              <button onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-sm text-slate-400 bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                Students can self-register. Use this form to create <strong className="text-slate-200">Department staff accounts</strong> (Department role).
              </p>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text" required value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="form-input" placeholder="e.g., IT Services Rep"
                />
                {createUserErrors.name && <p className="form-error">{createUserErrors.name[0]}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email" required value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="form-input" placeholder="user@university.edu"
                />
                {createUserErrors.email && <p className="form-error">{createUserErrors.email[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password" required value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="form-input" placeholder="Min 8 chars"
                  />
                  {createUserErrors.password && <p className="form-error">{createUserErrors.password[0]}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password" required value={newUser.password_confirmation}
                    onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                    className="form-input" placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value, department_id: '' })}
                  className="form-select bg-slate-900 border-slate-700 text-slate-100"
                >
                  <option value="student">Student</option>
                  <option value="department">Department Staff</option>
                </select>
              </div>

              {newUser.role === 'department' && (
                <div className="form-group">
                  <label className="form-label">Assign to Department</label>
                  <select
                    value={newUser.department_id}
                    onChange={(e) => setNewUser({ ...newUser, department_id: e.target.value })}
                    required
                    className="form-select bg-slate-900 border-slate-700 text-slate-100"
                  >
                    <option value="" disabled>Select a department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {createUserErrors.department_id && <p className="form-error">{createUserErrors.department_id[0]}</p>}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-800 pt-4 gap-3">
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creatingUser} className="btn-primary flex items-center gap-2">
                  {creatingUser ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <><Plus className="h-4 w-4" /> Create User</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ADMIN PROFILE TAB ===== */}
      {activeTab === 'profile' && (
        <div className="w-full max-w-4xl bg-[#0F172A]/40 backdrop-blur-md border border-slate-800/80 rounded-3xl shadow-lg grid grid-cols-12 overflow-hidden mx-auto">
          {/* Left Section (Dark Info) */}
          <div className="col-span-12 md:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between min-h-[400px] relative">
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4">
              <div className="bg-rose-600/20 border border-rose-500/30 p-3 rounded-2xl w-fit text-rose-400 shadow-md">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-wide">Admin Settings</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Configure your system administrator access credentials and security details.
              </p>
            </div>

            <div className="flex items-center gap-2 text-rose-400 mt-6 border-t border-slate-800/60 pt-6">
              <Shield className="h-5 w-5" />
              <span className="text-xs uppercase font-bold tracking-wider">
                System Administrator
              </span>
            </div>
          </div>

          {/* Right Section (Form) */}
          <div className="col-span-12 md:col-span-7 p-8 space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {profileSuccess && (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm">
                  {profileError}
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Admin Name"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-800 my-4"></div>

              {/* Password Controls */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  <span>Security Settings (Leave blank to keep current)</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="form-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(user?.name || '');
                    setEmail(user?.email || '');
                    setPassword('');
                    setPasswordConfirmation('');
                    setActiveTab('dashboard');
                  }}
                  className="text-slate-400 hover:text-slate-200 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 shadow-rose-900/10"
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
    </div>
  );
};

export default AdminDashboard;
