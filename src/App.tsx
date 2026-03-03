import React, { useState } from 'react';
import { CreateVoucher } from './components/CreateVoucher';
import { VerifyVoucher } from './components/VerifyVoucher';
import { PlusCircle, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabState = 'CREATE' | 'VERIFY';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabState>('CREATE');

  return (
    <div className="flex flex-col h-screen w-full bg-emerald-50 font-sans text-slate-900 selection:bg-emerald-100 overflow-hidden">
      {/* Header */}
      <header className="h-[8%] min-h-[50px] bg-emerald-700 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-700 shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-white">VALES<span className="text-emerald-200">GÁS</span></h1>
        </div>
        <div className="text-[10px] font-black text-emerald-100 uppercase tracking-widest bg-emerald-800/50 px-2 py-1 rounded-full border border-emerald-600">
          v2.0 PWA
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="h-[8%] min-h-[50px] bg-white border-b border-emerald-100 flex shrink-0">
        <button
          onClick={() => setActiveTab('CREATE')}
          className={`flex-1 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-tighter transition-all ${
            activeTab === 'CREATE' 
              ? 'text-emerald-700 border-b-4 border-emerald-600 bg-emerald-50/50' 
              : 'text-slate-400 hover:text-emerald-600'
          }`}
        >
          <PlusCircle size={18} />
          CRIAR VALE
        </button>
        <button
          onClick={() => setActiveTab('VERIFY')}
          className={`flex-1 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-tighter transition-all ${
            activeTab === 'VERIFY' 
              ? 'text-emerald-700 border-b-4 border-emerald-600 bg-emerald-50/50' 
              : 'text-slate-400 hover:text-emerald-600'
          }`}
        >
          <Search size={18} />
          CONSULTAR VALE
        </button>
      </div>

      {/* Main Content */}
      <main className="h-[84%] flex-1 overflow-hidden relative">
        <div className="h-full w-full max-w-md mx-auto px-4 py-4 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'CREATE' ? (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full w-full"
              >
                <CreateVoucher />
              </motion.div>
            ) : (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full w-full"
              >
                <VerifyVoucher />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
