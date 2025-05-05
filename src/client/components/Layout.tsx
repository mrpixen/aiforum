import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            Modern Forum
          </Link>
          <nav className="main-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
            <Link to="/categories" className={location.pathname === '/categories' ? 'active' : ''}>
              Categories
            </Link>
            <Link to="/threads" className={location.pathname === '/threads' ? 'active' : ''}>
              Threads
            </Link>
          </nav>
          <div className="user-nav">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">Welcome, {user.username}!</span>
                <Link to="/notifications" className="notifications-link">
                  Notifications
                </Link>
                <Link to="/profile" className="profile-link">
                  Profile
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Login
                </Link>
                <Link to="/register" className="register-link">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Modern Forum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 