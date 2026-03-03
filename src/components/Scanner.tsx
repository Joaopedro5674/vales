import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScan: (id: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanning after success
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        }

        // Logic: Se QR tiver parâmetro ?id= usar o id. Se for texto puro, usar como ID_VALE
        let id = decodedText;
        try {
          const url = new URL(decodedText);
          const params = new URLSearchParams(url.search);
          if (params.has('id')) {
            id = params.get('id') || decodedText;
          }
        } catch (e) {
          // Not a URL, use raw text
        }
        
        onScan(id);
      },
      (error) => {
        // Ignore errors
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div id="reader" className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg"></div>
      <p className="text-center mt-4 text-slate-500 text-sm font-medium">
        Aponte a câmera para o QR Code do vale
      </p>
    </div>
  );
};
