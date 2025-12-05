'use client';

import { useState } from 'react';
import type { Address } from '../../src/types';

interface QRCodeDisplayProps {
  address: Address;
}

export default function QRCodeDisplay({ address }: QRCodeDisplayProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');

  // Generate QR code data (simplified - in production use a QR library)
  const generateQRData = () => {
    // This would use address.pid and create an encrypted token
    return `veyvault://address/${address.pid}`;
  };

  const handleDownload = () => {
    // TODO: Implement actual QR code download using a library like qrcode.react
    const qrData = generateQRData();
    alert(`Downloading QR code for: ${qrData}`);
    
    // In production, you would:
    // 1. Generate actual QR code image using a library
    // 2. Create a downloadable blob
    // 3. Trigger download
  };

  const handleShare = async () => {
    const qrData = generateQRData();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Address QR Code',
          text: `QR Code for ${address.label || address.type}`,
          url: qrData,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrData);
      alert('QR code link copied to clipboard!');
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
        {/* Placeholder QR code - Replace with actual QR library */}
        <div style={{
          width: '256px',
          height: '256px',
          margin: '0 auto',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#6b7280',
          position: 'relative',
        }}>
          {/* QR Code Pattern (simplified visual) */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            border: '4px solid black',
            borderRadius: '4px',
          }} />
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            border: '4px solid black',
            borderRadius: '4px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            border: '4px solid black',
            borderRadius: '4px',
          }} />
          
          {/* Center pattern */}
          <div style={{
            width: '120px',
            height: '120px',
            background: `repeating-linear-gradient(
              90deg,
              black,
              black 10px,
              white 10px,
              white 20px
            )`,
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '8px',
            fontSize: '12px',
            color: '#9ca3af',
          }}>
            {address.pid}
          </div>
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
      </div>
    </div>
  );
}
