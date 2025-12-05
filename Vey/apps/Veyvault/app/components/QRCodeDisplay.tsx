'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Address } from '../../src/types';

interface QRCodeDisplayProps {
  address: Address;
}

export default function QRCodeDisplay({ address }: QRCodeDisplayProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR code data with encrypted token
  const generateQRData = () => {
    // Create encrypted token for privacy-preserving address sharing
    return JSON.stringify({
      type: 'veyvault_address',
      version: '1.0',
      pid: address.pid,
      token: address.encryptedData,
      timestamp: new Date().toISOString(),
    });
  };

  const handleDownload = () => {
    const qrData = generateQRData();
    
    if (downloadFormat === 'svg') {
      // Download SVG
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veyvault-qr-${address.pid}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Download PNG
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `veyvault-qr-${address.pid}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleShare = async () => {
    const qrData = generateQRData();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Address QR Code',
          text: `QR Code for ${address.label || address.type} address`,
          url: `veyvault://address/${address.pid}`,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrData);
      alert('QR code data copied to clipboard!');
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        QR Code
      </h3>

      {/* QR Code Display */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div ref={qrRef} style={{ display: 'inline-block' }}>
          <QRCodeSVG
            value={generateQRData()}
            size={256}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/vey-logo.svg',
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#9ca3af',
        }}>
          {address.pid}
        </div>
      </div>

      {/* Download Format */}
      <div className="form-group">
        <label className="form-label">Download Format</label>
        <select
          className="form-select"
          value={downloadFormat}
          onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg')}
        >
          <option value="png">PNG Image</option>
          <option value="svg">SVG Vector</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1 }}>
          📥 Download
        </button>
        <button onClick={handleShare} className="btn btn-secondary" style={{ flex: 1 }}>
          📤 Share
        </button>
      </div>

      {/* Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#6b7280',
      }}>
        <p><strong>Address ID:</strong> {address.pid}</p>
        <p style={{ marginTop: '4px' }}>
          <strong>Generated:</strong> {new Date().toLocaleString()}
        </p>
        <p style={{ marginTop: '4px' }}>
          <strong>🔐 Encrypted:</strong> Address data is end-to-end encrypted
        </p>
      </div>
    </div>
  );
}
