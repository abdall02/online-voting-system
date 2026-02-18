import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    ArrowLeft,
    Trash2,
    Loader2,
    LayoutDashboard,
    UserPlus,
    Clock,
    BarChart3,
    FileText,
    LogOut,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { API_URL, logout } = useContext(AuthContext);

    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Renamed state to reflect "Party" context
    const [newCandidate, setNewCandidate] = useState({ name: '', image: null });

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/elections/${id}`);
            setElection(res.data.data);
            setCandidates(res.data.data.candidates);
        } catch (err) {
            toast.error('Failed to load election data');
            navigate('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append('name', newCandidate.name);
        if (newCandidate.image) {
            formData.append('image', newCandidate.image);
        }

        try {
            await axios.post(`${API_URL}/elections/${id}/candidates`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Party registered successfully');
            setNewCandidate({ name: '', image: null });
            // Reset the file input manually
            e.target.reset();
            fetchDetails();
        } catch (err) {
            toast.error('Registration failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm('Are you sure you want to remove this party from the ballot?')) return;
        try {
            await axios.delete(`${API_URL}/candidates/${candidateId}`);
            toast.success('Party removed');
            fetchDetails();
        } catch (err) {
            toast.error('Failed to remove party');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/admin') },
        // Other items would navigate back to dashboard tabs normally
    ];

    if (isLoading) return (
        <div className="admin-loading">
            <Loader2 className="animate-spin" size={48} style={{ color: '#0288D1' }} />
            <p>Loading Election Details...</p>
        </div>
    );

    return (
        <div className="admin-layout">
            {/* Sidebar (Simplified for consistency) */}
            <aside className="admin-sidebar">
                <nav className="admin-sidebar-nav">
                    <button onClick={() => navigate('/admin')} className="admin-sidebar-item">
                        <ArrowLeft size={18} />
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="my-2 border-t border-white/10"></div>
                    <button className="admin-sidebar-item active">
                        <FileText size={18} />
                        <span>Election Details</span>
                    </button>
                </nav>

                <button onClick={handleLogout} className="admin-logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-dashboard-content">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="admin-tab-title">{election.title}</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Status: <span className={`admin-status-badge ${election.status}`}>{election.status}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Register Party Form */}
                        <div className="admin-section-card h-fit">
                            <h3 className="admin-section-title">Register Party / Candidate</h3>
                            <form onSubmit={handleAddCandidate} className="admin-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        Party Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        placeholder="e.g., Kulmiye Party"
                                        value={newCandidate.name}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Party Logo <span className="required">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            required
                                            accept="image/*"
                                            className="form-input pl-10 pt-2"
                                            onChange={(e) => setNewCandidate({ ...newCandidate, image: e.target.files[0] })}
                                        />
                                        <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Select the party logo from your device.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="login-submit-btn"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Add Party to Ballot'}
                                </button>
                            </form>
                        </div>

                        {/* Candidates List */}
                        <div className="admin-section-card">
                            <h3 className="admin-section-title">Registered Parties ({candidates.length})</h3>

                            <div className="flex flex-col gap-3">
                                {candidates.length === 0 ? (
                                    <p className="admin-empty-text">No parties registered yet.</p>
                                ) : (
                                    candidates.map((candidate) => (
                                        <div key={candidate._id} className="admin-election-item">
                                            <div className="flex items-center gap-4">
                                                {/* Logo Preview */}
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {candidate.image && candidate.image !== 'no-photo.jpg' ? (
                                                        <img
                                                            src={candidate.image.startsWith('http') ? candidate.image : `${API_URL.replace('/api', '')}${candidate.image}`}
                                                            alt={candidate.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-400">{candidate.name.charAt(0)}</span>
                                                    )}
                                                </div>

                                                <div className="admin-election-info">
                                                    <h4>{candidate.name}</h4>
                                                    <p>{candidate.voteCount} votes cast</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteCandidate(candidate._id)}
                                                className="admin-delete-btn"
                                                title="Remove Party"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminElectionDetails;
