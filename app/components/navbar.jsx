"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout, authLoading } = useAuth();
  const cartCount = getCartCount();

  const handleLogout = async () => {
    await logout();
    setProfileDropdown(false);
    setMenuOpen(false);
  };

  return (
    <header className="luxury-header">
      <div className="container">
        <nav className="luxury-navbar">
          
          {/* LOGO */}
          <Link href="/" className="luxury-logo">
            <Image
              src="/logo.png"
              alt="Khushi Crochet Logo"
              width={160}
              height={100}
              className="logo-img"
              priority
            />
          </Link>

          {/* TOGGLE */}
          <button
            type="button"
            className={`luxury-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* MENU */}
          <div className={`luxury-menu ${menuOpen ? "show" : ""}`}>
            
            <a href="#home" className="luxury-link" onClick={() => setMenuOpen(false)}>
              Home
            </a>

            <a href="/products" className="luxury-link" onClick={() => setMenuOpen(false)}>
              Shop
            </a>

            <a href="#about" className="luxury-link" onClick={() => setMenuOpen(false)}>
              About
            </a>

            <a href="#custom-order-hero" className="luxury-link" onClick={() => setMenuOpen(false)}>
              Custom Orders
            </a>

            <a href="#contact" className="luxury-link" onClick={() => setMenuOpen(false)}>
              Contact
            </a>

            <Link href="/order-track" className="luxury-link" onClick={() => setMenuOpen(false)}>
              Track Order
            </Link>

             <Link href="/cart" className="luxury-link cart-link" onClick={() => setMenuOpen(false)}>
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Show auth links only when not logged in */}
            {!authLoading && !user && (
              <>
                <Link href="/login" className="luxury-link" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>

                <Link href="/register" className="luxury-link" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}

            {/* Show profile dropdown when logged in */}
            {!authLoading && user && (
              <div className="profile-dropdown-wrapper">
                <button
                  className="luxury-link profile-button"
                  onClick={() => setProfileDropdown(!profileDropdown)}
                >
                  👤 {user.name}
                </button>
                {profileDropdown && (
                  <div className="profile-dropdown-menu">
                    <Link 
                      href="/profile" 
                      className="dropdown-item"
                      style={{ '--icon': '"👤"' }}
                      onClick={() => {
                        setProfileDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>👤</span>
                      <span>My Profile</span>
                    </Link>
                    <Link 
                      href="/orders" 
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <span>My Orders</span>
                    </Link>
                    <Link 
                      href="/confirmations" 
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>✅</span>
                      <span>Confirmations</span>
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>❤️</span>
                      <span>Wishlist</span>
                    </Link>
                    <Link 
                      href="/account-settings" 
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>⚙️</span>
                      <span>Account Settings</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link 
                        href="/admin" 
                        className="dropdown-item admin-link"
                        onClick={() => {
                          setProfileDropdown(false);
                          setMenuOpen(false);
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🔧</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <span style={{ fontSize: '16px' }}>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </nav>
      </div>

      <style jsx>{`
        .cart-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cart-badge {
          position: absolute;
          top: -10px;
          right: -14px;
          background: var(--accent-dark);
          color: white;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          box-shadow: var(--shadow-sm);
        }

        .profile-dropdown-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .profile-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          padding: 0;
          color: inherit;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .profile-button:hover {
          color: var(--accent);
        }

        .profile-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: white;
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          min-width: 260px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: 14px 18px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-dark);
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          gap: 12px;
        }

        .dropdown-item:not(:last-child) {
          border-bottom: 1px solid var(--line-light);
        }

        .dropdown-item:hover {
          background: linear-gradient(90deg, rgba(196, 168, 120, 0.08) 0%, rgba(196, 168, 120, 0.03) 100%);
          color: var(--accent);
          padding-left: 22px;
        }

        .dropdown-item::before {
          content: attr(data-icon);
          flex-shrink: 0;
          font-size: 16px;
        }

        .logout-item {
          color: #d32f2f;
          font-weight: 600;
          border-top: 1px solid var(--line-light);
          margin-top: 4px;
          padding-top: 14px;
        }

        .logout-item:hover {
          background: linear-gradient(90deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.03) 100%);
          color: #b71c1c;
          padding-left: 22px;
        }

        .admin-link {
          color: var(--accent-dark);
          font-weight: 600;
          background: linear-gradient(90deg, rgba(196, 168, 120, 0.06) 0%, transparent 100%);
        }

        .admin-link:hover {
          background: linear-gradient(90deg, rgba(196, 168, 120, 0.12) 0%, rgba(196, 168, 120, 0.06) 100%);
          color: var(--accent);
          padding-left: 22px;
        }

        @media (max-width: 768px) {
          .profile-dropdown-menu {
            position: static;
            box-shadow: none;
            border: none;
            margin-top: 0;
            background: transparent;
            border-radius: 0;
            animation: none;
            border-top: 1px solid var(--line);
          }

          .dropdown-item {
            padding: 16px 18px;
            font-size: 14px;
            border-bottom: 1px solid var(--line-light);
          }

          .dropdown-item:hover {
            background: var(--cream);
            padding-left: 18px;
          }

          .logout-item {
            border-top: 1px solid var(--line-light);
            margin-top: 8px;
            padding-top: 16px;
          }

          .admin-link {
            background: transparent;
          }

          .admin-link:hover {
            background: var(--cream);
          }
        }
      `}</style>
    </header>
  );
}