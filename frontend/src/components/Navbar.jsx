import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Vote, LogOut, User, LayoutDashboard, Sun, Moon } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-morphism sticky top-0 z-50 px-6 py-4 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-primary dark:text-primary-light font-extrabold text-2xl tracking-tight">
                    <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/30">
                        <Vote size={24} />
                    </div>
                    <span>UOB Voting</span>
                </Link>

                <div className="flex items-center space-x-4 md:space-x-8">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300"
                        aria-label="Toggle Theme"
                    >
                        {darkMode ? <Sun size={20} className="animate-in spin-in-180 duration-500" /> : <Moon size={20} className="animate-in spin-in-180 duration-500" />}
                    </button>

                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="flex items-center space-x-2 text-text-secondary hover:text-primary dark:hover:text-primary-light font-semibold transition-colors">
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                <div className="flex items-center space-x-4 border-l pl-6 border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="btn-primary py-2 px-6">Login</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Only Logout (Simplified) */}
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="md:hidden p-2 text-text-secondary hover:text-danger"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
