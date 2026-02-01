import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore.js';
import '../styles/header.css';
import { BsBoxArrowRight } from "react-icons/bs";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const firstName = (() => {
    const name = (user?.name || '').trim();
    if (!name) return 'Account';
    const [first] = name.split(/\s+/);
    return first || 'Account';
  })();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const onPointerDown = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query.length === 0) {
      navigate('/products');
      return;
    }
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo">
              <h1>Daprique</h1>
            </Link>
          </div>

          <div className="header-center">
            <nav className="nav">
              <Link to="/products" className="nav-link">
                Explore
              </Link>
              <Link to="/cart" className="nav-link">
                Cart
              </Link>
              <Link to="/wishlist" className="nav-link">
                Wishlist
              </Link>
            </nav>

            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-menu-trigger"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  <span className="user-name">Hi, {firstName}</span>
                  <span className="user-menu-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu-dropdown" role="menu">
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      role="menuitem"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="user-menu-item user-menu-item-danger"
                      onClick={handleLogout}
                    >
                      Logout
                      <span className="logout-icon" aria-hidden="true">
                        <BsBoxArrowRight />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link ghost-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link primary-link">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
