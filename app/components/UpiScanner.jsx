"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";

export default function UpiScanner({ onScan, totalAmount }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const toggleScanner = () => {
    setScanning(!scanning);
    setError('');
  };

  useEffect(() => {
    let scanner;
    if (scanning) {
      const onScanSuccess = (decodedText) => {
        setScanning(false);
        onScan(decodedText);
      };

      const onScanError = () => {
        // silent fail
      };

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning, onScan]);

  return (
    <div className="upi-scanner-container">
      <div className="upi-scanner-toggle-wrapper">
        <button 
          onClick={toggleScanner}
          className={`upi-scan-btn ${scanning ? 'upi-scan-btn-stop' : 'upi-scan-btn-start'}`}
          aria-label={scanning ? 'Stop QR scanner' : 'Start QR scanner for UPI transaction'}
        >
          {scanning ? 'Stop Scanner' : '📱 Scan QR to Auto-fill'}
        </button>
        <small className="upi-scan-hint">
          Scan any UPI payment confirmation QR
        </small>
      </div>

      {error && (
        <div className="upi-scan-error">
          {error}
        </div>
      )}

      {scanning && (
        <div 
          id="qr-reader" 
          className="upi-qr-reader-wrapper"
        />
      )}
    </div>
  );
}
