import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PlusCircle, ListTodo, User as UserIcon, Ticket, Bell, 
  Building2, Clipboard, Clock, CheckCircle2, TrendingUp, Lock, Mail, Key, 
  Shield, AlertCircle, RefreshCw, Paperclip, Send, ChevronRight, LogOut,
  Inbox, MessageSquare, X, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Asset Image
import studentsCollImage from '../assets/students_collaborating.png';

const StudentDashboard: React.FC = () => {
  // Navigation & Auth
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'my-concerns' | 'public-concerns' | 'profile'>('dashboard');
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Public Concerns State
  const [publicComplaints, setPublicComplaints] = useState<any[]>([]);
  const [publicPage, setPublicPage] = useState(1);
  const [publicLastPage, setPublicLastPage] = useState(1);
  const [publicSearch, setPublicSearch] = useState('');
  const [publicFilterDept, setPublicFilterDept] = useState('');
  const [publicLoading, setPublicLoading] = useState(false);
  
  // Public Concern details modal
  const [viewingPublicConcern, setViewingPublicConcern] = useState<any | null>(null);
  const [viewingPublicModal, setViewingPublicModal] = useState(false);
  const [loadingPublicDetail, setLoadingPublicDetail] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deptId, setDeptId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Active Selected Complaint (My Concerns tab)
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Profile Edit State
  const [fullName, setFullName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [studentId, setStudentId] = useState(user.student_id || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedComplaint?.responses]);

  // Fetch initial dashboard stats & lists
  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [statsRes, myComplaintsRes, , deptsRes] = await Promise.all([
        api.get('/student/dashboard-stats'),
        api.get('/student/my-complaints'),
        api.get('/student/dashboard'),
        api.get('/student/departments')
      ]);
      setStats(statsRes.data);
      setMyComplaints(myComplaintsRes.data);
      setDepartments(deptsRes.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to refresh data. Please try again.');
    }
  };

  const fetchPublicComplaints = async (page = 1, search = publicSearch, dept = publicFilterDept) => {
    setPublicLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (search) params.set('search', search);
      if (dept) params.set('department_id', dept);
      
      const res = await api.get(`/student/dashboard?${params}`);
      
      setPublicComplaints(res.data.data || []);
      setPublicPage(res.data.current_page || 1);
      setPublicLastPage(res.data.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch public complaints:', err);
    } finally {
      setPublicLoading(false);
    }
  };

  const handleViewPublicDetail = async (complaint: any) => {
    setViewingPublicConcern(complaint);
    setViewingPublicModal(true);
    setLoadingPublicDetail(true);
    try {
      const res = await api.get(`/student/complaints/${complaint.id}`);
      setViewingPublicConcern(res.data.complaint);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPublicDetail(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'public-concerns') {
      fetchPublicComplaints(1, publicSearch, publicFilterDept);
    }
  }, [activeTab, publicFilterDept]);

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

  // Upvote Handler for Public Feed
  const handleUpvote = async (complaintId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/student/complaints/${complaintId}/upvote`);
      const { upvotes_count, voted } = res.data;
      
      // Update my complaints if in list
      setMyComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return { ...c, upvotes_count, has_upvoted: voted };
        }
        return c;
      }));

      // Update public complaints if in list
      setPublicComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return { ...c, upvotes_count, has_upvoted: voted };
        }
        return c;
      }));

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev: any) => ({
          ...prev,
          upvotes_count,
          has_upvoted: voted
        }));
      }

      if (viewingPublicConcern && viewingPublicConcern.id === complaintId) {
        setViewingPublicConcern((prev: any) => ({
          ...prev,
          upvotes_count,
          has_upvoted: voted
        }));
      }
    } catch (err) {
      console.error('Failed to toggle upvote', err);
    }
  };

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Submit Complaint Handler
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (body.length < 20) {
      setError('Detailed Description must be at least 20 characters.');
      return;
    }
    if (!deptId) {
      setError('Please select a department.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('department_id', deptId);
    formData.append('is_anonymous', isAnonymous ? '1' : '0');
    formData.append('is_private', isPrivate ? '1' : '0');
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      await api.post('/student/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Clear fields
      setTitle('');
      setBody('');
      setDeptId('');
      setIsAnonymous(false);
      setIsPrivate(false);
      setAttachment(null);
      setSuccessMsg('Your concern has been submitted successfully.');
      
      // Refresh details
      await fetchDashboardData();
      setActiveTab('my-concerns');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  // Select a concern in My Concerns tab and load fresh responses
  const handleSelectConcern = async (complaint: any) => {
    setSelectedComplaint(complaint);
    try {
      const res = await api.get(`/student/complaints/${complaint.id}`);
      setSelectedComplaint({
        ...res.data.complaint,
        has_upvoted: res.data.has_upvoted
      });
    } catch (err) {
      console.error('Failed to load fresh replies', err);
    }
  };

  // Send a response/message reply in chat
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedComplaint) return;

    setReplyLoading(true);
    try {
      const res = await api.post(`/student/complaints/${selectedComplaint.id}/respond`, {
        body: replyText
      });
      const newResponse = res.data.response;

      // Append reply locally
      setSelectedComplaint((prev: any) => ({
        ...prev,
        responses: [...(prev.responses || []), newResponse]
      }));

      // Update in main list as well
      setMyComplaints(prev => prev.map(c => {
        if (c.id === selectedComplaint.id) {
          return {
            ...c,
            responses: [...(c.responses || []), newResponse]
          };
        }
        return c;
      }));

      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Profile Update Handler
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
        student_id: studentId,
      };

      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }

      const res = await api.put('/student/profile', payload);
      const updatedUser = res.data.user;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
      setPasswordConfirmation('');
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

  // Helper: Format Ticket Code
  const getTicketCode = (complaint: any) => {
    const deptSlug = complaint.department?.slug || 'GEN';
    let prefix = 'GEN';
    if (deptSlug.includes('facilities')) prefix = 'FAC';
    else if (deptSlug.includes('it-services')) prefix = 'IT';
    else if (deptSlug.includes('housing')) prefix = 'HOU';
    else if (deptSlug.includes('academic') || deptSlug.includes('registrar')) prefix = 'REG';
    else if (deptSlug.includes('security')) prefix = 'SEC';
    else if (deptSlug.includes('finance')) prefix = 'FIN';

    const date = new Date(complaint.created_at || new Date());
    const year = date.getFullYear();
    const padId = String(complaint.id).padStart(3, '0');
    return `${prefix.toUpperCase()}-${year}-${padId}`;
  };

  // Helper: Status Badges for Light Theme
  const getLightBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'closed':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // Current active tab heading label
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview';
      case 'submit': return 'Submit Concern';
      case 'my-concerns': return 'My Concerns';
      case 'public-concerns': return 'Public Concerns';
      case 'profile': return 'Student Profile';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 bg-[#0D1527] text-slate-400 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo Heading */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">ConcernConnect</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Student Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1 px-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800/40 text-white border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-slate-800/40 text-white border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Submit Concern</span>
            </button>

            <button
              onClick={() => setActiveTab('my-concerns')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'my-concerns'
                  ? 'bg-slate-800/40 text-white border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <ListTodo className="h-5 w-5" />
              <span>My Concerns</span>
            </button>

            <button
              onClick={() => setActiveTab('public-concerns')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'public-concerns'
                  ? 'bg-slate-800/40 text-white border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <Inbox className="h-5 w-5" />
              <span>Public Concerns</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-800/40 text-white border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20 border-l-4 border-transparent'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/40 space-y-2">
          <button
            onClick={() => setActiveTab('submit')}
            className="w-full bg-white text-[#0D1527] hover:bg-slate-100 font-bold py-3.5 px-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-center gap-2 text-sm transition-all duration-150 cursor-pointer"
          >
            <Ticket className="h-4.5 w-4.5" />
            <span>New Support Ticket</span>
          </button>
          
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
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 md:hidden">
              {/* Menu Icon for Mobile */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-800">{getTabTitle()}</h2>
          </div>

          {/* Right Info */}
          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-5.5 w-5.5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user.name || 'Student Account'}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {user.student_id ? `ID: ${user.student_id}` : `STUDENT #${user.id}`}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-extrabold text-base uppercase">
                {user.name ? user.name.charAt(0) : 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT AREA ─── */}
        <main className="flex-1 overflow-y-auto">
          {error && activeTab !== 'submit' && activeTab !== 'profile' && (
            <div className="mx-10 mt-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ────────────────── OVERVIEW TAB ────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="p-10 space-y-8 animate-fade-up">
              {/* Welcome Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Welcome back, {user.name?.split(' ')[0] || 'Student'}.</h3>
                  <p className="text-slate-500 text-sm mt-1">Here is the current status of your academic and campus concerns.</p>
                </div>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="bg-[#0D1527] hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all duration-150 cursor-pointer"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Submit New Concern</span>
                </button>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Submitted</p>
                    <p className="text-4xl font-extrabold text-slate-800">{stats.total}</p>
                    <p className="text-xs text-indigo-500 font-semibold flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>2 more than last term</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Clipboard className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pending</p>
                    <p className="text-4xl font-extrabold text-slate-800">{String(stats.pending).padStart(2, '0')}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Awaiting department review</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Resolved</p>
                    <p className="text-4xl font-extrabold text-slate-800">{String(stats.resolved).padStart(2, '0')}</p>
                    <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolution rate</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Recent Concerns List (Left Column) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">My Concerns History</h4>
                    <button
                      onClick={() => setActiveTab('my-concerns')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All History</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {myComplaints.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Clipboard className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="text-sm">You haven't submitted any concerns yet.</p>
                      <button 
                        onClick={() => setActiveTab('submit')}
                        className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Submit one now
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 pr-4">Title</th>
                            <th className="pb-3 px-4">Department</th>
                            <th className="pb-3 px-4">Date</th>
                            <th className="pb-3 pl-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {myComplaints.slice(0, 5).map((c) => (
                            <tr 
                              key={c.id} 
                              onClick={() => {
                                handleSelectConcern(c);
                                setActiveTab('my-concerns');
                              }}
                              className="text-sm hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="py-4 pr-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {c.title}
                              </td>
                              <td className="py-4 px-4 text-slate-500">
                                {c.department?.name || 'Unassigned'}
                              </td>
                              <td className="py-4 px-4 text-slate-400">
                                {new Date(c.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', day: 'numeric', year: 'numeric' 
                                })}
                              </td>
                              <td className="py-4 pl-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getLightBadge(c.status)}`}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Focus Sidebar Card */}
                <div className="lg:col-span-4 bg-[#0D1527] text-white rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-[450px]">
                  {/* Decorative mesh/grad glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Top Text content */}
                  <div className="p-6 space-y-3 z-10">
                    <h4 className="text-xl font-bold tracking-tight">Your Voice Matters.</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      We aim for a 48-hour initial response time on all submitted concerns. Thank you for helping us build a better campus environment.
                    </p>
                  </div>

                  {/* Illustration Image in Center */}
                  <div className="px-6 flex justify-center z-10 shrink-0">
                    <img 
                      src={studentsCollImage} 
                      alt="Students Collaborating"
                      className="h-32 object-contain rounded-xl"
                    />
                  </div>

                  {/* Campus Focus Box at Bottom */}
                  <div className="p-6 bg-slate-900/60 backdrop-blur-sm border-t border-slate-800 z-10 space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-slate-400">Current Campus Focus</span>
                      <span className="text-indigo-400">85% Resolved</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[85%] rounded-full"></div>
                    </div>
                    
                    <p className="text-[11px] italic text-slate-400 text-center">
                      "Improving Campus Infrastructure - Term 2"
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ────────────────── SUBMIT CONCERN TAB ────────────────── */}
          {activeTab === 'submit' && (
            <div className="p-10 max-w-4xl mx-auto space-y-8 animate-fade-up">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-800">Submit a New Concern</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Please provide detailed information so we can assist you effectively. Your voice helps us improve our campus community.
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 space-y-6">
                <form onSubmit={handleSubmitComplaint} className="space-y-6">
                  {successMsg && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold">
                      {successMsg}
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-3 text-sm">
                      <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Subject Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Subject of Concern</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Facility Maintenance issue in Hall B"
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3.5 px-4 outline-none transition-all duration-150 text-sm shadow-inner"
                    />
                  </div>

                  {/* Department Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Department / Category</label>
                    <div className="relative">
                      <select
                        required
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3.5 px-4 outline-none transition-all duration-150 text-sm cursor-pointer appearance-none shadow-inner"
                      >
                        <option value="" disabled className="text-slate-400">Select a department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id} className="text-slate-800">
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Description</label>
                    <textarea
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Provide as much detail as possible about the concern, including dates, locations, and any previous attempts to resolve it."
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3.5 px-4 outline-none transition-all duration-150 min-h-[150px] resize-none text-sm shadow-inner"
                    />
                  </div>

                  {/* File Attachment Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Attachment (Optional, Max 5MB)</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-500/40 transition-all duration-150">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <Paperclip className="h-5 w-5 mb-1.5 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">
                          {attachment ? attachment.name : 'Upload files (images, PDFs, documents)'}
                        </p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {/* Checkbox cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Submit Anonymously Card */}
                    <div 
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`border rounded-xl p-4 flex items-start gap-4 transition-all duration-150 cursor-pointer select-none ${
                        isAnonymous 
                          ? 'border-indigo-500 bg-indigo-50/10' 
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={() => {}} // handled by click container
                        className="w-5 h-5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/20 cursor-pointer mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">Submit Anonymously</p>
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          If enabled, your name and student ID will be hidden from staff. Note that we may not be able to follow up with you personally.
                        </p>
                      </div>
                    </div>

                    {/* Submit Privately Card */}
                    <div 
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`border rounded-xl p-4 flex items-start gap-4 transition-all duration-150 cursor-pointer select-none ${
                        isPrivate 
                          ? 'border-indigo-500 bg-indigo-50/10' 
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={() => {}} // handled by click container
                        className="w-5 h-5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/20 cursor-pointer mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">Submit Privately</p>
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          If enabled, your Complaints will be private. Note that we may not be able to follow up with you personally.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="text-slate-500 hover:text-slate-700 font-bold text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#0D1527] hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      {submitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span>Submit Concern</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Policy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 flex gap-4">
                  <div className="text-indigo-600 shrink-0 mt-0.5">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Privacy First</h5>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Your data is encrypted and handled according to university privacy standards.
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 flex gap-4">
                  <div className="text-indigo-600 shrink-0 mt-0.5">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">24h Response</h5>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      We aim to review and assign all new concerns within one business day.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── MY CONCERNS TAB ────────────────── */}
          {activeTab === 'my-concerns' && (
            <div className="flex h-[calc(100vh-80px)] overflow-hidden">
              
              {/* Left Column - List of concerns */}
              <div className="w-2/5 border-r border-slate-100 bg-white flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-100 flex flex-col gap-1 shrink-0">
                  <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                  <p className="text-slate-400 text-xs font-semibold">Track the status of your reported issues</p>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {myComplaints.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Clipboard className="h-8 w-8 mx-auto text-slate-300" />
                      <p className="text-xs">No active concerns tracked.</p>
                    </div>
                  ) : (
                    myComplaints.map((c) => {
                      const isSelected = selectedComplaint && selectedComplaint.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectConcern(c)}
                          className={`p-5 flex items-center justify-between cursor-pointer transition-all duration-150 border-l-4 ${
                            isSelected 
                              ? 'bg-slate-50/80 border-l-indigo-600' 
                              : 'border-l-transparent hover:bg-slate-50/30'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 pr-4">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                              {getTicketCode(c)}
                            </span>
                            <h4 className={`text-sm font-bold truncate transition-colors ${
                              isSelected ? 'text-indigo-600' : 'text-slate-800'
                            }`}>
                              {c.title}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span>{c.department?.name}</span>
                              <span>•</span>
                              <span>
                                {new Date(c.created_at).toLocaleDateString(undefined, {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })}
                              </span>
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getLightBadge(c.status)}`}>
                              {c.status}
                            </span>
                            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-indigo-500' : ''}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column - Detail chat panel */}
              <div className="w-3/5 bg-white flex flex-col h-full overflow-hidden">
                {!selectedComplaint ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <ListTodo className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800">Select a Concern</h4>
                      <p className="text-xs max-w-xs leading-relaxed">
                        Select an item from the list on the left to track its resolution timeline and view messages with the department.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            {getTicketCode(selectedComplaint)}
                          </span>
                          {selectedComplaint.is_private && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Shield className="h-3 w-3" /> Private
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-800 truncate">{selectedComplaint.title}</h4>
                      </div>
                      
                      {/* Upvotes */}
                      <button
                        onClick={(e) => handleUpvote(selectedComplaint.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          selectedComplaint.has_upvoted
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
                        </svg>
                        <span>{selectedComplaint.upvotes_count || 0} Upvotes</span>
                      </button>
                    </div>

                    {/* Timeline progress tracker */}
                    <div className="p-6 border-b border-slate-100 bg-[#F8FAFC]/50 shrink-0">
                      <div className="flex items-center justify-between max-w-md mx-auto relative px-6">
                        
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-200 -translate-y-1/2 z-0">
                          <div className={`h-full bg-indigo-500 transition-all duration-300 ${
                            selectedComplaint.status === 'pending'
                              ? 'w-0'
                              : selectedComplaint.status === 'investigating'
                              ? 'w-1/2'
                              : 'w-full'
                          }`}></div>
                        </div>

                        {/* Stage 1: Pending */}
                        <div className="flex flex-col items-center gap-1.5 z-10">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-md">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-800">Pending</span>
                        </div>

                        {/* Stage 2: Investigating */}
                        <div className="flex flex-col items-center gap-1.5 z-10">
                          <div className={`h-8 w-8 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-md transition-colors ${
                            selectedComplaint.status !== 'pending'
                              ? 'bg-indigo-600'
                              : 'bg-slate-200'
                          }`}>
                            {selectedComplaint.status !== 'pending' ? (
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800">In Progress</span>
                        </div>

                        {/* Stage 3: Resolved */}
                        <div className="flex flex-col items-center gap-1.5 z-10">
                          <div className={`h-8 w-8 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-md transition-colors ${
                            selectedComplaint.status === 'resolved' || selectedComplaint.status === 'closed'
                              ? 'bg-indigo-600'
                              : 'bg-slate-200'
                          }`}>
                            {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'closed' ? (
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800">Resolved</span>
                        </div>

                      </div>
                    </div>

                    {/* Scrollable details & responses thread */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                      {/* Complaint Info Block */}
                      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Issue Description</h5>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                          {selectedComplaint.body}
                        </p>
                        
                        {selectedComplaint.attachment_path && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mt-3">
                            <span className="text-slate-500 font-semibold truncate max-w-xs flex items-center gap-1">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>Evidence Attachment</span>
                            </span>
                            <a 
                              href={`http://127.0.0.1:8000/storage/${selectedComplaint.attachment_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 font-bold hover:underline"
                            >
                              View File
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-slate-100"></div>

                      {/* Chat Messages */}
                      <div className="space-y-4">
                        <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                          <span>Message Thread</span>
                          <span className="bg-slate-100 text-slate-500 rounded-full h-5 px-1.5 flex items-center justify-center text-[10px] font-bold">
                            {selectedComplaint.responses?.length || 0}
                          </span>
                        </h5>

                        {(!selectedComplaint.responses || selectedComplaint.responses.length === 0) ? (
                          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                            No response updates from the department yet. Keep checking here for updates.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedComplaint.responses.map((response: any) => {
                              const isStudent = response.user_id === user.id;
                              
                              return (
                                <div 
                                  key={response.id}
                                  className={`flex gap-3 max-w-[85%] ${
                                    isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                  }`}
                                >
                                  {/* Avatar */}
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                    isStudent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {response.user?.name ? response.user.name.charAt(0) : 'U'}
                                  </div>

                                  <div className="space-y-1">
                                    {/* Author Label */}
                                    <p className={`text-[10px] font-bold text-slate-400 ${
                                      isStudent ? 'text-right' : 'text-left'
                                    }`}>
                                      {isStudent ? 'You' : `${response.user?.name} (Staff)`} • {
                                        new Date(response.created_at).toLocaleDateString(undefined, {
                                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })
                                      }
                                    </p>

                                    {/* Bubble */}
                                    <div className={`p-4.5 rounded-2xl text-sm leading-relaxed ${
                                      isStudent 
                                        ? 'bg-[#0D1527] text-white rounded-tr-none shadow-sm'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                                    }`}>
                                      <p>{response.body}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div ref={chatEndRef} />
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Chat Text Input footer */}
                    <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                      <form onSubmit={handleSendReply} className="flex gap-3">
                        <textarea
                          rows={1}
                          required
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-4 outline-none transition-all duration-150 resize-none text-sm shadow-inner"
                        />
                        <button
                          type="submit"
                          disabled={replyLoading || !replyText.trim()}
                          className="h-11 w-11 shrink-0 bg-[#0D1527] hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-md transition-all duration-150 cursor-pointer"
                        >
                          {replyLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Send className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </form>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* ────────────────── PROFILE TAB ────────────────── */}
          {activeTab === 'profile' && (
            <div className="p-10 flex items-center justify-center animate-fade-up">
              
              {/* Profile Card Container */}
              <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl shadow-lg grid grid-cols-12 overflow-hidden">
                
                {/* Left Section (Dark Info) */}
                <div className="col-span-12 md:col-span-5 bg-[#0D1527] text-white p-8 flex flex-col justify-between min-h-[400px] relative">
                  {/* Design accent */}
                  <div className="absolute bottom-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="space-y-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl w-fit text-white shadow-md">
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold tracking-wide">Personal Settings</h4>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                      Manage your academic identity, email preferences, and security credentials.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-indigo-400 mt-6 border-t border-slate-800/60 pt-6">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-xs uppercase font-bold tracking-wider">Verified Student</span>
                  </div>
                </div>

                {/* Right Section (Form) */}
                <div className="col-span-12 md:col-span-7 p-8 space-y-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {profileSuccess && (
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold">
                        {profileSuccess}
                      </div>
                    )}

                    {profileError && (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
                        {profileError}
                      </div>
                    )}

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <UserIcon className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Email</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex.rivera@university.edu"
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Email changes require secondary verification.</p>
                    </div>

                    {/* Student ID */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Clipboard className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g., 2024-0891"
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-10 outline-none transition-all duration-150 text-sm shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4"></div>

                    {/* Change Password inputs */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        <span>Security Settings</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Change Password</label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                              <Key className="h-4.5 w-4.5" />
                            </div>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter new password"
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
                              placeholder="Confirm new password"
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
                          setFullName(user.name || '');
                          setEmail(user.email || '');
                          setStudentId(user.student_id || '');
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
                        className="bg-[#0D1527] hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
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
            </div>
          )}

          {/* ────────────────── PUBLIC CONCERNS TAB ────────────────── */}
          {activeTab === 'public-concerns' && (
            <div className="p-10 space-y-8 animate-fade-up">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-800">Public Concerns</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Browse public concerns from other students, see their status, and upvote to show support.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={publicSearch}
                      onChange={(e) => setPublicSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchPublicComplaints(1, publicSearch, publicFilterDept)}
                      placeholder="Search public concerns..."
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-2 px-4 outline-none text-xs transition-all shadow-inner"
                    />
                  </div>
                  <button
                    onClick={() => fetchPublicComplaints(1, publicSearch, publicFilterDept)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={publicFilterDept}
                    onChange={(e) => {
                      setPublicFilterDept(e.target.value);
                      fetchPublicComplaints(1, publicSearch, e.target.value);
                    }}
                    className="form-select bg-slate-50 border-slate-200 text-slate-700 text-xs py-2 px-3.5 rounded-xl outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setPublicSearch('');
                      setPublicFilterDept('');
                      fetchPublicComplaints(1, '', '');
                    }}
                    className="btn-outline py-2 px-3 rounded-xl text-xs text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Table of Public Concerns */}
              {publicLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <p className="text-sm text-slate-500">Loading public concerns...</p>
                </div>
              ) : publicComplaints.length === 0 ? (
                <div className="card card-body empty-state border-slate-100 bg-white shadow-sm p-12 text-center flex flex-col items-center rounded-3xl">
                  <div className="empty-state-icon bg-slate-100 p-4 rounded-full text-slate-400 mb-3">
                    <Inbox className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No Concerns Found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    No public concerns have been submitted to departments matching your search or filters.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Support / Upvote</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Concern Details</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date Received</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</th>
                          <th className="px-6 py-4.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {publicComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4.5">
                              <button
                                onClick={(e) => handleUpvote(c.id, e)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                  c.has_upvoted
                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-sm'
                                    : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                                }`}
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{c.upvotes_count || 0} Upvotes</span>
                              </button>
                            </td>
                            <td className="px-6 py-4.5 max-w-xs">
                              <div className="font-bold text-slate-800 truncate">{c.title}</div>
                              <div className="text-slate-400 text-xs truncate mt-0.5">{c.body}</div>
                            </td>
                            <td className="px-6 py-4.5">
                              <span className="text-slate-600 text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                                {c.department?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-slate-500 text-xs font-medium">
                              {new Date(c.created_at).toLocaleDateString(undefined, { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-4.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getLightBadge(c.status)}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <button
                                onClick={() => handleViewPublicDetail(c)}
                                className="btn-primary btn-sm py-1.5 px-3 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                View Details <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {publicLastPage > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
                      <button
                        disabled={publicPage === 1}
                        onClick={() => fetchPublicComplaints(publicPage - 1)}
                        className="btn-outline py-1.5 px-3 rounded-lg border-slate-200 disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span>
                        Page <strong>{publicPage}</strong> of <strong>{publicLastPage}</strong>
                      </span>
                      <button
                        disabled={publicPage === publicLastPage}
                        onClick={() => fetchPublicComplaints(publicPage + 1)}
                        className="btn-outline py-1.5 px-3 rounded-lg border-slate-200 disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ─── PUBLIC CONCERN DETAIL MODAL ─── */}
      {viewingPublicModal && viewingPublicConcern && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative card w-full max-w-2xl bg-white border border-slate-150 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl text-slate-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Concern Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Reference ID: #{viewingPublicConcern.id}</p>
              </div>
              <button 
                onClick={() => { setViewingPublicModal(false); setViewingPublicConcern(null); }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPublicDetail ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
                <p className="text-sm text-slate-400">Loading details...</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getLightBadge(viewingPublicConcern.status)}`}>
                    Status: {viewingPublicConcern.status.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={(e) => handleUpvote(viewingPublicConcern.id, e)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      viewingPublicConcern.has_upvoted
                        ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{viewingPublicConcern.upvotes_count || 0} Upvotes</span>
                  </button>
                </div>

                {/* Body details */}
                <div className="space-y-2.5">
                  <h2 className="text-lg font-bold text-slate-800">{viewingPublicConcern.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-5 rounded-2xl whitespace-pre-line shadow-inner">
                    {viewingPublicConcern.body}
                  </p>
                </div>

                {/* Submitter & Date */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="flex items-center gap-2">
                    {viewingPublicConcern.is_anonymous ? (
                      <>
                        <Shield className="h-4.5 w-4.5 text-slate-400" />
                        <span className="font-semibold text-slate-500">Submitted Anonymously</span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-4.5 w-4.5 text-indigo-500" />
                        <span className="text-slate-700 font-semibold">
                          Submitted by: {viewingPublicConcern.user?.name || 'Student'}
                        </span>
                      </>
                    )}
                  </span>
                  
                  <span className="flex items-center gap-1.5 ml-auto text-slate-400 font-medium">
                    <Calendar className="h-4 w-4" />
                    Received: {new Date(viewingPublicConcern.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Attachment */}
                {viewingPublicConcern.attachment_path && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 font-bold">Attached Document/Evidence</span>
                    </div>
                    <a 
                      href={`http://127.0.0.1:8000/storage/${viewingPublicConcern.attachment_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-outline btn-sm text-xs py-1.5 px-3 rounded-xl bg-white flex items-center gap-1 border-slate-200 text-slate-600 hover:text-indigo-600"
                    >
                      View File
                    </a>
                  </div>
                )}

                <div className="h-px bg-slate-100"></div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                    Official Responses ({viewingPublicConcern.responses?.length || 0})
                  </h4>

                  {!viewingPublicConcern.responses || viewingPublicConcern.responses.length === 0 ? (
                    <p className="p-5 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold italic border border-slate-100">
                      No response has been added to this complaint yet.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-56 overflow-y-auto pr-2">
                      {viewingPublicConcern.responses.map((response: any) => (
                        <div key={response.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span className="text-indigo-600">{response.user?.name} ({response.user?.role === 'department' ? 'Dept Representative' : 'Student'})</span>
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
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
