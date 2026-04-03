"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo-link" aria-label="Khushi Crochet Home">
              <Image
                src="/logo.png"
                alt="Khushi Crochet Logo"
                width={160}
                height={70}
                className="footer-logo"
                priority
              />
            </Link>

            <p className="footer-brand-text">
              Handmade crochet creations crafted with love, elegance, and a
              refined luxury touch for meaningful gifting and beautiful everyday moments.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Shop</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/track-order">Track Order</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <p><span>Email:</span> khushicrochet@gmail.com</p>
            <p><span>Phone:</span> +91 9876543210</p>
            <p><span>Location:</span> Ahmedabad, India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Khushi Crochet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}