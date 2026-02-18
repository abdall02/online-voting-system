import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, API_URL } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const loginData = {
            password,
            [identifier.includes('@') ? 'email' : 'studentId']: identifier
        };

        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, loginData);
            login(loginRes.data);
            toast.success('Login successful! Welcome back.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="student-login-page">
            <div className="student-login-card" style={{ position: 'relative' }}>
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
                    <img src="/download.jpg" alt="University of Bosaso Logo" className="w-24 h-24 object-contain" />
                </div>

                {/* Title */}
                <h1 className="student-login-title">Student Login</h1>
                <p className="student-login-subtitle">University of Bosaso Online Voting System</p>

                {/* Form */}
                <form className="student-login-form" onSubmit={handleSubmit}>
                    {/* Identifier */}
                    <div className="form-group">
                        <label className="form-label">
                            Student ID or Email <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g., UOB12345 or student@email.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">
                            Password <span className="required">*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: '#9ca3af', padding: 0
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-submit-btn"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Login to Vote'}
                    </button>
                </form>

                {/* Register Link */}
                <p className="login-register-link">
                    Only university students are eligible to vote
                </p>
            </div>
        </div>
    );
};

export default Login;
