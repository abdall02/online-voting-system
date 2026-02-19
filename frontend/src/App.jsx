import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import ElectionDetails from './pages/ElectionDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminElectionDetails from './pages/AdminElectionDetails';
import AdminLogin from './pages/AdminLogin';
import ResultsArchive from './pages/ResultsArchive';
import StudentDashboard from './pages/StudentDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin-login';
  const isAuthPage = location.pathname === '/login';
  const isElectionPage = location.pathname.startsWith('/elections/');
  const isResultsPage = location.pathname === '/results';
  const isDashboardPage = location.pathname === '/dashboard';
  const hideNavFooter = isHomePage || isAdminPage || isAdminLogin || isAuthPage || isElectionPage || isResultsPage || isDashboardPage;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-300 flex flex-col font-inter">
      {!hideNavFooter && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      <main className={isHomePage || isAdminPage ? '' : isAdminLogin ? '' : 'flex-grow container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/elections/:id" element={<ElectionDetails />} />
          <Route path="/results" element={<ResultsArchive />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/elections/:id" element={
            <ProtectedRoute role="admin">
              <AdminElectionDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!hideNavFooter && (
        <footer className="py-12 text-center text-text-secondary border-t border-gray-200 dark:border-gray-800 mt-12 transition-colors duration-300">
          <p className="font-medium">© 2026 University of Bosaso Online Voting System. Built for security and transparency.</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-card-dark dark:text-text-primary-dark shadow-xl rounded-xl border border-gray-100 dark:border-gray-800'
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
