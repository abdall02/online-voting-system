import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, API_URL } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Check if username is simple 'admin', map to seed email, otherwise rely on input
            const identifier = username.toLowerCase() === 'admin' ? 'uobgadmin@gmail.com' : username;

            const res = await axios.post(`${API_URL}/auth/login`, {
                [identifier.includes('@') ? 'email' : 'studentId']: identifier,
                password
            });

            if (res.data.user.role !== 'admin') {
                toast.error('Access denied. Admin credentials required.');
                setIsLoading(false);
                return;
            }

            login(res.data);
            toast.success('Welcome to Admin Panel');
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card" style={{ position: 'relative' }}>
                {/* Back Arrow */}
                <Link
                    to="/"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                    <ArrowLeft size={24} />
                </Link>
                {/* University Logo */}
                <div className="login-logo">
                    <img src="/download.jpg" alt="University of Bosaso Logo" className="w-24 h-24 object-contain mx-auto" />
                </div>

                {/* Title */}
                <h1 className="admin-login-title">Admin Login</h1>
                <p className="admin-login-subtitle">University of Bosaso - Secure Access</p>

                {/* Form */}
                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            required
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-submit-btn"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Login to Admin Panel'}
                    </button>
                </form>

                <p className="admin-powered-by">
                    Powered by University of Bosaso IT
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
