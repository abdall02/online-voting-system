import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Verify = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, API_URL } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const phone = location.state?.phone;

    useEffect(() => {
        if (!phone) {
            navigate('/login');
        }
    }, [phone, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/verify-otp`, { phone, code });
            login(res.data);
            toast.success('Verification successful! Welcome.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="student-login-page">
            <div className="student-login-card">
                {/* University Logo */}
                <div className="login-logo">
                    <img src="/download.jpg" alt="University of Bosaso Logo" className="w-24 h-24 object-contain" />
                </div>

                {/* Title */}
                <h1 className="student-login-title">Verify Phone</h1>
                <p className="student-login-subtitle">
                    Enter the code sent to {phone}
                </p>

                {/* Form */}
                <form className="student-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Verification Code <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            maxLength="6"
                            className="form-input text-center text-2xl tracking-widest font-bold"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || code.length !== 6}
                        className="login-submit-btn"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Verify Code'}
                    </button>
                </form>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-500 hover:text-primary text-sm font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Verify;
