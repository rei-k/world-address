'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import type { Address } from '../../src/types';

interface QRBarcodeDisplayProps {
  address: Address;
}

type DisplayMode = 'qr' | 'barcode';

export default function QRBarcodeDisplay({ address }: QRBarcodeDisplayProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('qr');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const qrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  // Generate barcode when in barcode mode
  useEffect(() => {
    if (displayMode === 'barcode' && barcodeRef.current) {
      try {
        // Generate CODE128 barcode from PID
        JsBarcode(barcodeRef.current, address.pid, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [displayMode, address.pid]);

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
    if (displayMode === 'qr') {
      downloadQRCode();
    } else {
      downloadBarcode();
    }
  };

  const downloadQRCode = () => {
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

  const downloadBarcode = () => {
    if (!barcodeRef.current) return;

    if (downloadFormat === 'svg') {
      // Download SVG
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veyvault-barcode-${address.pid}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Download PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `veyvault-barcode-${address.pid}.png`;
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
          title: `My Address ${displayMode === 'qr' ? 'QR Code' : 'Barcode'}`,
          text: `${displayMode === 'qr' ? 'QR Code' : 'Barcode'} for ${address.label || address.type} address`,
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
      alert(`${displayMode === 'qr' ? 'QR code' : 'Barcode'} data copied to clipboard!`);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        QR Code & Barcode
      </h3>

      {/* Display Mode Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
        }}>
          <button
            onClick={() => setDisplayMode('qr')}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: 'none',
              background: displayMode === 'qr' ? 'white' : 'transparent',
              color: displayMode === 'qr' ? '#1f2937' : '#6b7280',
              fontWeight: displayMode === 'qr' ? '600' : '400',
              cursor: 'pointer',
              boxShadow: displayMode === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📱 QR Code
          </button>
          <button
            onClick={() => setDisplayMode('barcode')}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: 'none',
              background: displayMode === 'barcode' ? 'white' : 'transparent',
              color: displayMode === 'barcode' ? '#1f2937' : '#6b7280',
              fontWeight: displayMode === 'barcode' ? '600' : '400',
              cursor: 'pointer',
              boxShadow: displayMode === 'barcode' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📊 Barcode
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '20px',
        textAlign: 'center',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {displayMode === 'qr' ? (
          <div ref={qrRef} style={{ display: 'inline-block' }}>
            <QRCodeSVG
              value={generateQRData()}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
        ) : (
          <div style={{ display: 'inline-block' }}>
            <svg ref={barcodeRef}></svg>
          </div>
        )}
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
          <strong>Display Mode:</strong> {displayMode === 'qr' ? 'QR Code' : 'Barcode (CODE128)'}
        </p>
        <p style={{ marginTop: '4px' }}>
          <strong>Generated:</strong> {new Date().toLocaleString()}
        </p>
        <p style={{ marginTop: '4px' }}>
          <strong>🔐 Encrypted:</strong> Address data is end-to-end encrypted
        </p>
      </div>

      {/* Usage Info */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af',
      }}>
        <p style={{ fontWeight: '600', marginBottom: '8px' }}>
          ✨ Usage:
        </p>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>QR Code: For mobile scanning and friend sharing</li>
          <li>Barcode: For hotel check-ins and financial institutions</li>
          <li>Both formats work with VeyPOS systems</li>
        </ul>
      </div>
    </div>
  );
}
