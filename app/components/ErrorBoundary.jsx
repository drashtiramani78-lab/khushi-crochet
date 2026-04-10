"use client";

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f5f0',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%'
            }}>
              <h1 style={{
                color: '#b08d57',
                fontSize: '2rem',
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                Something went wrong
              </h1>
              <p style={{
                color: '#666',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                Sorry, an unexpected error occurred.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  backgroundColor: '#b08d57',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#9f7a45'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#b08d57'}
              >
                Reload Page
              </button>
            </div>
          </div>
        );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
