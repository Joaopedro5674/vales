import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { VoucherForm } from './components/VoucherForm';
import { VoucherDetails } from './components/VoucherDetails';
import { API_URL, VoucherData } from './types';
import { QrCode, RefreshCw, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewState = 'SCAN' | 'FORM' | 'DETAILS' | 'LOADING' | 'ERROR';

export default function App() {
  const [view, setView] = useState<ViewState>('SCAN');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (id: string) => {
    setCurrentId(id);
    setView('LOADING');
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_URL}?id=${id}`);
      if (!response.ok) throw new Error('API Offline');
      
      const data = await response.json();
      
      if (data.existe) {
        setVoucherData(data);
        setView('DETAILS');
      } else {
        setView('FORM');
      }
    } catch (err) {
      setErrorMsg('Erro ao conectar com o servidor. Verifique sua internet.');
      setView('ERROR');
    }
  };

  const reset = () => {
    setView('SCAN');
    setCurrentId(null);
    setVoucherData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'SCAN' && (
            <button 
              onClick={reset}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-black tracking-tighter text-blue-600">VALES<span className="text-slate-400">GÁS</span></h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {view === 'SCAN' && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Escanear Vale</h2>
                <p className="text-slate-500 font-medium">Posicione o QR Code no centro da tela</p>
              </div>
              <Scanner onScan={handleScan} />
              <div className="pt-8 flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <QrCode className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-600">Leitor Ativo</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'LOADING' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="font-bold text-slate-400 animate-pulse">Consultando Banco de Dados...</p>
            </motion.div>
          )}

          {view === 'FORM' && currentId && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <VoucherForm id={currentId} onSuccess={(data) => {
                setVoucherData(data);
                setView('DETAILS');
              }} />
            </motion.div>
          )}

          {view === 'DETAILS' && voucherData && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VoucherDetails data={voucherData} onUpdate={setVoucherData} />
            </motion.div>
          )}

          {view === 'ERROR' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Ops! Algo deu errado</h3>
                <p className="text-slate-500 px-10">{errorMsg}</p>
              </div>
              <button 
                onClick={reset}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Nav (Mobile Style) */}
      {view === 'SCAN' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4 pb-8 flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 text-blue-600">
            <QrCode size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Scanner</span>
          </button>
          <div className="w-12 h-12 -mt-10 bg-blue-600 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-white border-4 border-slate-50">
            <QrCode size={24} />
          </div>
          <button onClick={() => alert('Em breve: Histórico')} className="flex flex-col items-center gap-1 text-slate-400">
            <RefreshCw size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sincronizar</span>
          </button>
        </nav>
      )}
    </div>
  );
}
