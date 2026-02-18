import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    UserPlus,
    Clock,
    BarChart3,
    FileText,
    LogOut,
    Users,
    Vote,
    UserCheck,
    CheckCircle,
    Loader2,
    Plus,
    Trash2,
    Trophy,
    TrendingUp,
    PieChart as PieIcon
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { API_URL, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalVoters: 0,
        totalVoted: 0,
        electionsCount: 0,
        participationRate: 0
    });
    const [elections, setElections] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [electionStatus, setElectionStatus] = useState('Open');
    const [timeLeft, setTimeLeft] = useState('');

    // Form states
    const [showElectionForm, setShowElectionForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        status: 'active'
    });
    const [isCreating, setIsCreating] = useState(false);

    // Register student form
    const [studentForm, setStudentForm] = useState({
        name: '', studentId: '', email: '', phone: '', password: ''
    });
    const [isRegistering, setIsRegistering] = useState(false);

    // Students list
    const [students, setStudents] = useState([]);
    const [isDeletingId, setIsDeletingId] = useState(null);

    useEffect(() => {
        fetchAdminData();
        fetchStudents();
    }, [API_URL]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data.data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const fetchAdminData = async () => {
        try {
            const [statsRes, electionsRes] = await Promise.all([
                axios.get(`${API_URL}/votes/stats`),
                axios.get(`${API_URL}/elections`)
            ]);
            setStats(statsRes.data.data);
            setElections(electionsRes.data.data);

            // Get candidates from first active election
            if (electionsRes.data.data.length > 0) {
                const activeElection = electionsRes.data.data.find(e => e.status === 'active') || electionsRes.data.data[0];
                setElectionStatus(activeElection.status === 'active' ? 'Open' : 'Closed');

                const electionDetail = await axios.get(`${API_URL}/elections/${activeElection._id}`);
                setCandidates(electionDetail.data.data.candidates || []);
            } else {
                // Reset state if no elections exist
                setCandidates([]);
                setElectionStatus('Closed');
                setStats({
                    totalVoters: stats.totalVoters, // Keep registration count
                    totalVoted: 0,
                    electionsCount: 0,
                    participationRate: 0
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const activeElection = elections.find(e => e.status === 'active');
        if (!activeElection) {
            setTimeLeft('');
            return;
        }

        const timer = setInterval(() => {
            const end = new Date(activeElection.endDate).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('EXPIRED');
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let timeStr = '';
            if (days > 0) timeStr += `${days}d `;
            timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setTimeLeft(timeStr);
        }, 1000);

        return () => clearInterval(timer);
    }, [elections]);

    const handleCertify = async (electionId) => {
        if (!window.confirm('Are you sure you want to certify these results and declare the winner officially? This action cannot be undone.')) return;
        try {
            const res = await axios.put(`${API_URL}/elections/${electionId}/certify`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchAdminData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Certification failed');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleToggleStatus = async () => {
        try {
            const activeElection = elections.find(e => e.status === 'active') || elections[0];
            if (!activeElection) return;

            const newStatus = activeElection.status === 'active' ? 'ended' : 'active';
            await axios.put(`${API_URL}/elections/${activeElection._id}`, { status: newStatus });
            toast.success(`Election ${newStatus === 'active' ? 'opened' : 'closed'}`);
            setElectionStatus(newStatus === 'active' ? 'Open' : 'Closed');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to toggle status');
        }
    };

    const handleCreateElection = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await axios.post(`${API_URL}/elections`, formData);
            toast.success('Election created successfully');
            setShowElectionForm(false);
            setFormData({ title: '', startDate: '', endDate: '', status: 'active' });
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create election');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            await axios.post(`${API_URL}/auth/register`, {
                ...studentForm,
                role: 'voter'
            });
            toast.success('Student registered successfully');
            setStudentForm({ name: '', studentId: '', email: '', phone: '', password: '' });
            fetchAdminData();
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteStudent = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) return;
        setIsDeletingId(id);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Student "${name}" deleted successfully`);
            fetchStudents();
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete student');
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleDeleteElection = async (id) => {
        if (!window.confirm('Are you sure you want to delete this election?')) return;
        try {
            await axios.delete(`${API_URL}/elections/${id}`);
            toast.success('Election deleted');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const remainingVoters = Math.max(0, stats.totalVoters - totalVotes);
    const turnoutPercent = stats.totalVoters > 0 ? ((totalVotes / stats.totalVoters) * 100).toFixed(1) : 0;

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'register', label: 'Register Students', icon: UserPlus },
        { id: 'election', label: 'Election Time Control', icon: Clock },
        { id: 'results', label: 'Results', icon: BarChart3 },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    if (isLoading) return (
        <div className="admin-loading">
            <Loader2 className="animate-spin" size={48} style={{ color: '#0288D1' }} />
            <p>Loading Admin Panel...</p>
        </div>
    );

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <nav className="admin-sidebar-nav">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="admin-logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="admin-dashboard-content">
                        {/* Stats Cards */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
                                    <Users size={24} style={{ color: '#1565C0' }} />
                                </div>
                                <p className="admin-stat-label">Total Registered Students</p>
                                <p className="admin-stat-value" style={{ color: '#1565C0' }}>{stats.totalVoters}</p>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
                                    <Vote size={24} style={{ color: '#2E7D32' }} />
                                </div>
                                <p className="admin-stat-label">Total Votes Cast</p>
                                <p className="admin-stat-value" style={{ color: '#2E7D32' }}>{totalVotes}</p>
                                <p className="admin-stat-sub">Turnout: {turnoutPercent}%</p>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ backgroundColor: '#FFF8E1' }}>
                                    <UserCheck size={24} style={{ color: '#F9A825' }} />
                                </div>
                                <p className="admin-stat-label">Remaining Voters</p>
                                <p className="admin-stat-value" style={{ color: '#F9A825' }}>{remainingVoters}</p>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
                                    <CheckCircle size={24} style={{ color: '#2E7D32' }} />
                                </div>
                                <p className="admin-stat-label">Election Status</p>
                                <p className="admin-stat-value" style={{ color: electionStatus === 'Open' ? '#2E7D32' : '#C62828' }}>
                                    {electionStatus}
                                </p>
                                {timeLeft && (
                                    <p className={`text-xs font-bold mt-1 ${timeLeft === 'EXPIRED' ? 'text-red-500' : 'text-blue-600'}`}>
                                        {timeLeft === 'EXPIRED' ? 'Time is up!' : `Ends in: ${timeLeft}`}
                                    </p>
                                )}
                                {elections.length > 0 && (
                                    <button onClick={handleToggleStatus} className="admin-toggle-status mt-2">
                                        Toggle Status
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Voting Progress */}
                        <div className="admin-section-card">
                            <h3 className="admin-section-title">Voting Progress</h3>

                            <div className="admin-progress-section">
                                <div className="admin-progress-header">
                                    <span>Voter Turnout</span>
                                    <span style={{ color: '#0288D1' }}>{turnoutPercent}%</span>
                                </div>
                                <div className="admin-progress-bar-bg">
                                    <div
                                        className="admin-progress-bar-fill"
                                        style={{ width: `${turnoutPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Party Vote Counts */}
                            <div className="admin-party-votes-grid">
                                {candidates.map((candidate, index) => (
                                    <div key={candidate._id} className="admin-party-vote-card">
                                        <p className="admin-party-vote-name">{candidate.name}</p>
                                        <p className="admin-party-vote-count" style={{ color: index === 0 ? '#1565C0' : '#00897B' }}>
                                            {candidate.voteCount} votes
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="admin-section-card">
                            <h3 className="admin-section-title">Quick Actions</h3>
                            <div className="admin-quick-actions">
                                <button
                                    onClick={() => setActiveTab('results')}
                                    className="admin-quick-btn admin-quick-blue"
                                >
                                    <BarChart3 size={18} />
                                    <span>View Detailed Results</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('register')}
                                    className="admin-quick-btn admin-quick-orange"
                                >
                                    <UserPlus size={18} />
                                    <span>Register Students</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('election')}
                                    className="admin-quick-btn admin-quick-teal"
                                >
                                    <Clock size={18} />
                                    <span>Election Control</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Register Students Tab */}
                {activeTab === 'register' && (
                    <div className="admin-tab-content">
                        <h2 className="admin-tab-title">Register New Student</h2>

                        {/* Registration Form */}
                        <div className="admin-section-card" style={{ maxWidth: 500 }}>
                            <form onSubmit={handleRegisterStudent} className="admin-form">
                                <div className="form-group">
                                    <label className="form-label">Full Name <span className="required">*</span></label>
                                    <input
                                        type="text" required className="form-input"
                                        placeholder="Student full name"
                                        value={studentForm.name}
                                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Student ID <span className="required">*</span></label>
                                    <input
                                        type="text" required className="form-input"
                                        placeholder="e.g., UOB12345"
                                        value={studentForm.studentId}
                                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input
                                        type="email" required className="form-input"
                                        placeholder="student@uobosaso.edu"
                                        value={studentForm.email}
                                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone <span className="required">*</span></label>
                                    <input
                                        type="tel" required className="form-input"
                                        placeholder="252-XX-XXXXXXX"
                                        value={studentForm.phone}
                                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password <span className="required">*</span></label>
                                    <input
                                        type="password" required className="form-input"
                                        placeholder="Minimum 6 characters"
                                        value={studentForm.password}
                                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={isRegistering} className="login-submit-btn">
                                    {isRegistering ? <Loader2 className="animate-spin" size={20} /> : 'Register Student'}
                                </button>
                            </form>
                        </div>

                        {/* Registered Students List */}
                        <div className="admin-section-card" style={{ marginTop: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h3 className="admin-section-title" style={{ margin: 0 }}>
                                    <Users size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                                    Registered Students ({students.length})
                                </h3>
                            </div>

                            {students.length === 0 ? (
                                <p className="admin-empty-text">No students registered yet.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f8fafc' }}>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>#</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>Name</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>Student ID</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>Email</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>Phone</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>Voted</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, index) => (
                                                <tr key={student._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{index + 1}</td>
                                                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{student.name}</td>
                                                    <td style={{ padding: '10px 12px', color: '#0288D1', fontFamily: 'monospace' }}>{student.studentId || '—'}</td>
                                                    <td style={{ padding: '10px 12px', color: '#374151' }}>{student.email}</td>
                                                    <td style={{ padding: '10px 12px', color: '#374151' }}>{student.phone}</td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                        <span style={{
                                                            padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                                            background: student.hasVoted ? '#dcfce7' : '#fef9c3',
                                                            color: student.hasVoted ? '#16a34a' : '#ca8a04'
                                                        }}>
                                                            {student.hasVoted ? 'Voted' : 'Not Yet'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleDeleteStudent(student._id, student.name)}
                                                            disabled={isDeletingId === student._id}
                                                            style={{
                                                                background: '#fee2e2', color: '#dc2626', border: 'none',
                                                                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                fontWeight: 600, fontSize: 13, transition: 'background 0.15s',
                                                                opacity: isDeletingId === student._id ? 0.6 : 1
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#fca5a5'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                                                        >
                                                            {isDeletingId === student._id
                                                                ? <Loader2 size={14} className="animate-spin" />
                                                                : <Trash2 size={14} />}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Election Time Control Tab */}
                {activeTab === 'election' && (
                    <div className="admin-tab-content">
                        <div className="admin-tab-header">
                            <h2 className="admin-tab-title">Election Management</h2>
                            <button onClick={() => setShowElectionForm(!showElectionForm)} className="admin-add-btn">
                                <Plus size={18} />
                                <span>New Election</span>
                            </button>
                        </div>

                        {showElectionForm && (
                            <div className="admin-section-card" style={{ maxWidth: 600 }}>
                                <h3 className="admin-section-title">Create New Election</h3>
                                <form onSubmit={handleCreateElection} className="admin-form">
                                    <div className="form-group">
                                        <label className="form-label">Election Title <span className="required">*</span></label>
                                        <input type="text" required className="form-input" placeholder="e.g., Student Union Election 2026"
                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="admin-form-row">
                                        <div className="form-group">
                                            <label className="form-label">Start Date</label>
                                            <input type="datetime-local" required className="form-input"
                                                value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End Date</label>
                                            <input type="datetime-local" required className="form-input"
                                                value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="admin-form-actions">
                                        <button type="button" onClick={() => setShowElectionForm(false)} className="admin-cancel-btn">Cancel</button>
                                        <button type="submit" disabled={isCreating} className="login-submit-btn" style={{ maxWidth: 200 }}>
                                            {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Create Election'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Elections List */}
                        <div className="admin-elections-list">
                            {elections.map(election => (
                                <div key={election._id} className="admin-election-item">
                                    <div className="admin-election-info">
                                        <h4>{election.title}</h4>
                                        <p>
                                            <span className={`admin-status-badge ${election.status}`}>{election.status}</span>
                                            {' '} | {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="admin-election-actions">
                                        <button onClick={() => navigate(`/admin/elections/${election._id}`)} className="admin-manage-btn">
                                            Manage
                                        </button>
                                        <button onClick={() => handleDeleteElection(election._id)} className="admin-delete-btn">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {elections.length === 0 && (
                                <p className="admin-empty-text">No elections created yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="admin-tab-content">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="admin-tab-title">Election Results</h2>
                            <p className="text-gray-500 font-medium">University of Bosaso - Live Results Dashboard</p>
                        </div>

                        {/* Summary Metrics */}
                        <div className="admin-stats-grid mb-8">
                            <div className="admin-stat-card border-t-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="admin-stat-label">Total Votes</p>
                                        <p className="admin-stat-value">{totalVotes}</p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Users size={20} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            {candidates.map((candidate, idx) => (
                                <div key={candidate._id} className={`admin-stat-card border-t-4`} style={{ borderTopColor: idx === 0 ? '#0288D1' : '#00897B' }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="admin-stat-label">{candidate.name}</p>
                                            <p className="admin-stat-value">{candidate.voteCount}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                            {candidate.image && candidate.image !== 'no-photo.jpg' ? (
                                                <img
                                                    src={candidate.image.startsWith('http') ? candidate.image : `${API_URL.replace('/api', '')}${candidate.image}`}
                                                    alt={candidate.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold">
                                                    {candidate.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Winner/Leader Banner */}
                        {candidates.length > 0 && (
                            <div className={`admin-leader-banner rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden ${elections.find(e => e.status === 'ended' && e.isCertified) ? 'bg-gradient-to-r from-yellow-600 to-amber-500' : 'bg-gradient-to-r from-blue-600 to-teal-500'}`}>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
                                        <Trophy size={48} className="text-yellow-300" />
                                    </div>
                                    <h3 className="text-xl font-medium opacity-90 mb-1">
                                        {elections.find(e => e.status === 'ended' && e.isCertified) ? 'OFFICIAL WINNER' : 'Current Leader'}
                                    </h3>
                                    <h2 className="text-4xl font-bold">
                                        {[...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].name}
                                    </h2>

                                    {/* Declare Winner Button for Admins */}
                                    {elections.some(e => e.status === 'ended' && !e.isCertified) && (
                                        <button
                                            onClick={() => handleCertify(elections.find(e => e.status === 'ended' && !e.isCertified)._id)}
                                            className="mt-6 px-8 py-3 bg-white text-amber-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            <span>Shaaci Guusha (Declare Winner)</span>
                                        </button>
                                    )}
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 flex items-center justify-center">
                                    <Trophy size={300} />
                                </div>
                            </div>
                        )}

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="admin-section-card">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieIcon size={20} className="text-blue-500" />
                                    <h3 className="admin-section-title mb-0">Vote Distribution</h3>
                                </div>
                                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                                    <Pie
                                        data={{
                                            labels: candidates.map(c => c.name),
                                            datasets: [{
                                                data: candidates.map(c => c.voteCount),
                                                backgroundColor: ['#0288D1', '#00897B', '#E65100', '#6A1B9A'],
                                                borderWidth: 0,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom' }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="admin-section-card">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp size={20} className="text-teal-500" />
                                    <h3 className="admin-section-title mb-0">Vote Comparison</h3>
                                </div>
                                <div style={{ height: '300px' }}>
                                    <Bar
                                        data={{
                                            labels: candidates.map(c => c.name),
                                            datasets: [{
                                                label: 'Votes',
                                                data: candidates.map(c => c.voteCount),
                                                backgroundColor: ['#0288D1', '#00897B', '#E65100', '#6A1B9A', '#C62828', '#2E7D32'],
                                                borderRadius: 8,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: { stepSize: 1 }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="admin-tab-content">
                        <h2 className="admin-tab-title">Reports</h2>
                        <div className="admin-section-card">
                            <div className="admin-report-summary">
                                <div className="admin-report-item">
                                    <span>Total Registered Students</span>
                                    <strong>{stats.totalVoters}</strong>
                                </div>
                                <div className="admin-report-item">
                                    <span>Total Votes Cast</span>
                                    <strong>{totalVotes}</strong>
                                </div>
                                <div className="admin-report-item">
                                    <span>Voter Turnout</span>
                                    <strong>{turnoutPercent}%</strong>
                                </div>
                                <div className="admin-report-item">
                                    <span>Active Elections</span>
                                    <strong>{elections.filter(e => e.status === 'active').length}</strong>
                                </div>
                                <div className="admin-report-item">
                                    <span>Total Elections</span>
                                    <strong>{elections.length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
