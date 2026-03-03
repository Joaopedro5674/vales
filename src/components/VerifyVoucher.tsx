import React, { useState } from 'react';
import { API_URL } from '../types';
import { Loader2, QrCode as QrIcon, Search, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Scanner } from './Scanner';
import { motion, AnimatePresence } from 'motion/react';

export const VerifyVoucher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  const formatarMoeda = (valor: any) => {
    const numero = Number(valor);
    if (isNaN(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const formatarTelefone = (valor: any) => {
    if (!valor) return "Não informado";
    const d = String(valor).replace(/\D/g, "");
    if (d.length === 0) return valor;
    if (d.length <= 2) return d;
    if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7, 11)}`;
  };

  const handleVerify = async (id: string) => {
    if (!id) return;

    const cleanId = id.trim();
    setLoading(true);
    setError(null);
    setVoucherData(null);

    try {
      // 1ª Tentativa: Envia o ID exatamente como digitado (sem espaços em branco)
      let response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ acao: "verificar", id_vale: cleanId })
      });
      let data = JSON.parse(await response.text());

      // 2ª Tentativa: Tenta com todas as letras maiúsculas (ex: vr-03 -> VR-03)
      if (!data.sucesso && cleanId !== cleanId.toUpperCase()) {
        response = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ acao: "verificar", id_vale: cleanId.toUpperCase() })
        });
        data = JSON.parse(await response.text());
      }

      // 3ª Tentativa: Tenta com todas as letras minúsculas (ex: VR-03 -> vr-03)
      if (!data.sucesso && cleanId !== cleanId.toLowerCase()) {
        response = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ acao: "verificar", id_vale: cleanId.toLowerCase() })
        });
        data = JSON.parse(await response.text());
      }

      if (data.sucesso) {
        setVoucherData(data.vale || data.dados || data.resultado || data);
      } else {
        setError('Vale não encontrado.');
      }
    } catch (err) {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!voucherData) return;
    const id = voucherData.id_vale || voucherData.ID_VALE;

    setFinalizing(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          acao: "finalizar",
          id_vale: id
        })
      });

      const texto = await response.text();
      const data = JSON.parse(texto);

      if (data.sucesso) {
        handleVerify(id);
      } else {
        alert('Erro ao finalizar: ' + (data.erro || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('Falha ao conectar com servidor');
    } finally {
      setFinalizing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = String(status).toUpperCase();
    if (s.includes('LIBERADO')) return 'bg-emerald-500';
    if (s.includes('RETIRADO')) return 'bg-blue-500';
    if (s.includes('VENCIDO')) return 'bg-red-500';
    return 'bg-slate-500';
  };

  const getStatusLabel = (status: string) => {
    const s = String(status).toUpperCase();
    if (s.includes('LIBERADO')) return 'LIBERADO';
    if (s.includes('RETIRADO')) return 'RETIRADO';
    if (s.includes('VENCIDO')) return 'VENCIDO';
    return s;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white p-4 rounded-3xl shadow-lg border border-emerald-100 flex gap-2 shrink-0">
          <input
            type="text"
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="ID do Vale (Ex: vr-01)"
          />
          <button
            onClick={() => handleVerify(searchId)}
            className="p-4 bg-emerald-600 text-white rounded-2xl active:scale-95 transition-all shadow-md"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl active:scale-95 transition-all"
          >
            <QrIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/50 backdrop-blur-sm z-10 rounded-3xl">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="font-black text-emerald-800 text-sm mt-3 uppercase tracking-widest">Buscando Vale...</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center space-y-3"
              >
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-red-600 font-black text-lg uppercase tracking-tight">{error}</p>
              </motion.div>
            )}

            {voucherData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 h-full flex flex-col"
              >
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${getStatusColor(voucherData.status || voucherData.STATUS)}`}>
                      {getStatusLabel(voucherData.status || voucherData.STATUS)}
                    </div>
                    <p className="font-black text-emerald-900 text-sm">ID: {voucherData.id_vale || voucherData.ID_VALE}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <User className="text-emerald-600" size={18} />
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase block">CLIENTE</span>
                        <p className="font-black text-slate-800 text-sm truncate">{voucherData.nome || voucherData.NOME}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <Phone className="text-emerald-600" size={18} />
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase block">TELEFONE</span>
                        <p className="font-black text-slate-800 text-sm">{formatarTelefone(voucherData.telefone || voucherData.TELEFONE)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <span className="text-[8px] font-black text-emerald-600 uppercase block">VALOR</span>
                        <p className="font-black text-emerald-900 text-base">{formatarMoeda(voucherData.valor_gas || voucherData.VALOR_GAS)}</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <span className="text-[8px] font-black text-emerald-600 uppercase block">QUANTIDADE</span>
                        <p className="font-black text-emerald-900 text-base">{voucherData.qtd_gas || voucherData.QTD_GAS} un</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block">EMISSÃO</span>
                      <p className="text-xs font-bold text-slate-700">{voucherData.data_emissao || voucherData.DATA_EMISSAO}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block">VENCIMENTO</span>
                      <p className="text-xs font-bold text-slate-700">{voucherData.data_vencimento || voucherData.DATA_VENCIMENTO}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pb-4">
                  {String(voucherData.status || voucherData.STATUS).toUpperCase().includes('VENCIDO') ? (
                    <div className="bg-red-600 p-5 rounded-2xl shadow-lg text-white text-center">
                      <h3 className="text-xl font-black tracking-tighter uppercase">Este vale está vencido</h3>
                    </div>
                  ) : String(voucherData.status || voucherData.STATUS).toUpperCase().includes('RETIRADO') ? (
                    <div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white text-center">
                      <h3 className="text-lg font-black tracking-tighter uppercase">Este vale foi resgatado em</h3>
                      <p className="font-bold text-sm opacity-90">{voucherData.data_resgate || voucherData.DATA_RETIRADA || voucherData.data_alteracao || voucherData.DATA_ALTERACAO}</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleFinalize}
                      disabled={finalizing}
                      className="w-full h-[65px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {finalizing ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                      FINALIZAR VALE
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex-1 relative">
              <Scanner onScan={(id) => {
                setSearchId(id);
                setShowScanner(false);
                handleVerify(id);
              }} />
            </div>
            <div className="p-6 bg-black/50 backdrop-blur-md">
              <button
                onClick={() => setShowScanner(false)}
                className="w-full h-[65px] bg-white text-black font-black rounded-2xl"
              >
                FECHAR CÂMERA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
