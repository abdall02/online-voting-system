import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        studentId: '', // Added Student ID field
        email: '',
        phone: '',
        password: '',
        role: 'voter'
    });
    const [isLoading, setIsLoading] = useState(false);

    const { API_URL } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            toast.success('Registration successful. Verify your phone number.');
            navigate('/verify', { state: { phone: formData.phone } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                <h1 className="student-login-title">Student Registration</h1>
                <p className="student-login-subtitle">University of Bosaso Online Voting System</p>

                {/* Form */}
                <form className="student-login-form" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="form-group">
                        <label className="form-label">
                            Full Name <span className="required">*</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g., Ahmed Mohamed"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Student ID (Optional for backend but good for UI) */}
                    <div className="form-group">
                        <label className="form-label">
                            Student ID Number <span className="required">*</span>
                        </label>
                        <input
                            name="studentId"
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g., UOB12345"
                            value={formData.studentId}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="form-input"
                            placeholder="student@uobosaso.edu"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label className="form-label">
                            Phone Number <span className="required">*</span>
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            className="form-input"
                            placeholder="252-XX-XXXXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">
                            Password <span className="required">*</span>
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="form-input"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-submit-btn"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Register'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="login-register-link">
                    Already have an account?{' '}
                    <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
