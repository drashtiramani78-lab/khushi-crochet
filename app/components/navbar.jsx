"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About", href: "/#about-section" },
  { label: "Custom Orders", href: "/customorder" },
  { label: "Contact", href: "/contact" },
  { label: "Track Order", href: "/order-track" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const { getCartCount } = useCart();
  const { user, logout, authLoading } = useAuth();

  const cartCount = getCartCount();

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdown(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setProfileDropdown(false);
      setMenuOpen(false);
    }
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="luxury-header">
      <div className="container">
        <nav className="luxury-navbar">
          <Link href="/" className="luxury-logo" aria-label="Khushi Crochet Home">
            <Image
              src="/logo.png"
              alt="Khushi Crochet Logo"
              width={160}
              height={100}
              className="logo-img"
              priority
            />
          </Link>

          <button
            type="button"
            className={`luxury-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`luxury-menu ${menuOpen ? "show" : ""}`}>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`luxury-link ${isActive(item.href) ? "active-link" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/cart"
              className={`luxury-link cart-link ${isActive("/cart") ? "active-link" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {!authLoading && !user && (
              <>
                <Link
                  href="/login"
                  className={`luxury-link ${isActive("/login") ? "active-link" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={`luxury-link ${isActive("/register") ? "active-link" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}

            {!authLoading && user && (
              <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="luxury-link profile-button"
                  onClick={() => setProfileDropdown((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={profileDropdown}
                >
                  <span className="profile-avatar">👤</span>
                  <span className="profile-name">{user.name}</span>
                </button>

                {profileDropdown && (
                  <div className="profile-dropdown-menu">
                    <Link href="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      <span>My Profile</span>
                    </Link>

                    <Link href="/orders" className="dropdown-item">
                      <span className="dropdown-icon">📦</span>
                      <span>My Orders</span>
                    </Link>

                    <Link href="/confirmations" className="dropdown-item">
                      <span className="dropdown-icon">✅</span>
                      <span>Confirmations</span>
                    </Link>

                    <Link href="/wishlist" className="dropdown-item">
                      <span className="dropdown-icon">❤️</span>
                      <span>Wishlist</span>
                    </Link>

                    <Link href="/account-settings" className="dropdown-item">
                      <span className="dropdown-icon">⚙️</span>
                      <span>Account Settings</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link href="/admin" className="dropdown-item admin-link">
                        <span className="dropdown-icon">🔧</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cart-badge {
          position: absolute;
          top: -10px;
          right: -16px;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          background: var(--accent-dark);
          color: #fff;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
          box-shadow: var(--shadow-sm);
        }

        .active-link {
          color: var(--accent);
          position: relative;
        }

        .active-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 2px;
          background: var(--accent);
          border-radius: 999px;
        }

        .profile-dropdown-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .profile-button {
          background: transparent;
          border: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0;
        }

        .profile-button:hover {
          color: var(--accent);
        }

        .profile-avatar {
          font-size: 16px;
          line-height: 1;
        }

        .profile-name {
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown-menu {
          position: absolute;
          top: calc(100% + 14px);
          right: 0;
          width: 260px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 999;
          animation: dropdownFade 0.22s ease;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border: none;
          background: transparent;
          text-decoration: none;
          color: var(--text-dark);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropdown-item:not(:last-child) {
          border-bottom: 1px solid var(--line-light);
        }

        .dropdown-item:hover {
          background: rgba(196, 168, 120, 0.08);
          color: var(--accent);
        }

        .dropdown-icon {
          width: 18px;
          display: inline-flex;
          justify-content: center;
          flex-shrink: 0;
          font-size: 15px;
        }

        .admin-link {
          color: var(--accent-dark);
          font-weight: 600;
          background: rgba(196, 168, 120, 0.06);
        }

        .logout-item {
          color: #c62828;
          font-weight: 600;
        }

        .logout-item:hover {
          background: rgba(198, 40, 40, 0.08);
          color: #a61d1d;
        }

        @media (max-width: 768px) {
          .active-link::after {
            display: none;
          }

          .cart-link {
            display: flex;
            width: 100%;
          }

          .cart-badge {
            position: static;
            margin-left: 6px;
          }

          .profile-dropdown-wrapper {
            width: 100%;
            display: block;
          }

          .profile-button {
            width: 100%;
            justify-content: flex-start;
          }

          .profile-dropdown-menu {
            position: static;
            width: 100%;
            margin-top: 10px;
            border-radius: 16px;
            box-shadow: none;
          }
        }
      `}</style>
    </header>
  );
}
