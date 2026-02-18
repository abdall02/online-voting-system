import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { API_URL } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeElections, setActiveElections] = useState([]);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await axios.get(`${API_URL}/elections`);
                const all = res.data.data || [];
                setActiveElections(all.filter(e => e.status === 'active'));
            } catch (err) {
                console.error('Failed to load elections:', err);
            }
        };
        fetchElections();
    }, [API_URL]);

    return (
        <div className="home-landing">
            {/* Background gradient overlay */}
            <div className="home-bg-gradient"></div>

            {/* Main Content */}
            <div className="home-content">
                {/* University Logo */}
                <div className="university-logo">
                    <img src="/download.jpg" alt="University of Bosaso Logo" className="w-24 h-24 object-contain" />
                </div>

                {/* University Title */}
                <h1 className="university-title">University of Bosaso</h1>
                <h2 className="university-subtitle">Online Voting System</h2>

                {/* Trust Badges */}
                <div className="trust-badges">
                    <div className="trust-badge">
                        <Shield size={16} />
                        <span>Secure</span>
                    </div>
                    <div className="trust-badge">
                        <CheckCircle size={16} />
                        <span>Transparent</span>
                    </div>
                    <div className="trust-badge">
                        <CheckCircle size={16} />
                        <span>Fair Student Elections</span>
                    </div>
                </div>

                {/* Active Election Banner */}
                {activeElections.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #0288D1, #0D47A1)',
                        borderRadius: 16,
                        padding: '16px 24px',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        boxShadow: '0 4px 20px rgba(2,136,209,0.3)',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 }}>
                                <Clock size={20} color="#fff" />
                            </div>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Election In Progress</p>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{activeElections[0].title}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#fff', color: '#0288D1', border: 'none',
                                borderRadius: 10, padding: '8px 18px', fontWeight: 700,
                                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap'
                            }}
                        >
                            Vote Now →
                        </button>
                    </div>
                )}

                {/* Login Cards — two separate cards */}
                <div className="login-cards-container">
                    {/* Student Login Card */}
                    <Link to="/login" className="login-card" id="student-login-card">
                        <div className="login-card-icon student-icon">
                            <User size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="login-card-title student-title">Student Login</h3>
                        <p className="login-card-desc">Cast your vote and participate in the election</p>
                    </Link>

                    {/* Admin Login Card */}
                    <Link to="/admin-login" className="login-card" id="admin-login-card">
                        <div className="login-card-icon admin-icon">
                            <Shield size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="login-card-title admin-title">Admin Login</h3>
                        <p className="login-card-desc">Manage elections and view results</p>
                    </Link>
                </div>

                {/* Register Info */}
                <div className="register-link-section">
                    <p className="register-text text-sm">
                        Only university students are eligible to vote
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
