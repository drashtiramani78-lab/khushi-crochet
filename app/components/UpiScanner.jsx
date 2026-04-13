"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";

export default function UpiScanner({ onScan, totalAmount, orderPreviewId }) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let scanner;
    if (scanning && scannerRef.current) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        onScanSuccess,
        onScanError
      );
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning]);

  const onScanSuccess = (decodedText) => {
    setScanning(false);
    onScan(decodedText);
  };

  const onScanError = (error) => {
    // silent fail
  };

  const toggleScanner = () => {
    setScanning(!scanning);
    setError('');
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleScanner}
          style={{
            padding: '8px 16px',
            border: '1px solid #b59a7a',
            background: scanning ? '#fff' : 'rgba(181, 154, 122, 0.1)',
            color: '#2f2723',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {scanning ? 'Stop Scanner' : '📱 Scan QR to Auto-fill'}
        </button>
        <small style={{ color: '#6e6259', fontSize: '12px' }}>
          Scan any UPI payment confirmation QR
        </small>
      </div>

      {error && (
        <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
          {error}
        </div>
      )}

      {scanning && (
        <div 
          id="qr-reader" 
          style={{ 
            marginTop: '12px', 
            width: '100%', 
            maxWidth: '300px',
            margin: '12px auto'
          }}
        />
      )}
    </div>
  );
}
