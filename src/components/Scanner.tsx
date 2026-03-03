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
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-emerald-500/30 bg-black shadow-2xl"></div>
      <div className="mt-6 text-center space-y-2">
        <p className="text-white text-lg font-black tracking-tight uppercase">Escaneando...</p>
        <p className="text-slate-400 text-xs font-medium px-8">
          Posicione o QR Code dentro da área demarcada para leitura automática
        </p>
      </div>
    </div>
  );
};
