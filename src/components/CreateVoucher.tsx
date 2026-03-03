import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL } from '../types';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const CreateVoucher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    valor_gas: '',
    qtd_gas: '1',
    prazo_dias: '30'
  });

  const maskTelefone = (valor: string) => {
    const d = valor.replace(/\D/g, "");
    if (d.length <= 2) return d;
    if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7, 11)}`;
  };

  const formatarMoeda = (valor: any) => {
    const numero = Number(valor);
    if (isNaN(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { nome, telefone, valor_gas, qtd_gas, prazo_dias } = formData;

    if (!nome || !telefone || !valor_gas || !qtd_gas || !prazo_dias) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (Number(valor_gas) < 0 || Number(qtd_gas) < 1 || Number(prazo_dias) < 1) {
      setError("Valores inválidos");
      return;
    }

    const dados = {
      acao: "criar",
      nome,
      telefone,
      valor_gas,
      qtd_gas,
      prazo_dias
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(dados)
      });
      
      const texto = await response.text();
      const resposta = JSON.parse(texto);

      if (resposta.sucesso) {
        setResult(resposta);
        setSuccess(true);
      } else {
        setError(resposta.erro || "Erro ao salvar");
      }
    } catch (err) {
      setError("Erro de conexão com servidor");
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${result.id_vale || result.ID_VALE}`;
    
    return (
      <div className="h-full flex flex-col justify-center animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Vale criado com sucesso!</h2>
          
          <div className="w-full bg-emerald-50 p-4 rounded-2xl my-4 space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
              <span className="text-slate-400">ID DO VALE</span>
              <span className="text-emerald-700">{result.id_vale || result.ID_VALE}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
              <span className="text-slate-400">PRAZO</span>
              <span className="text-emerald-700">{result.prazo_dias || formData.prazo_dias} dias</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
              <span className="text-slate-400">VENCIMENTO</span>
              <span className="text-emerald-700">{result.data_vencimento || result.DATA_VENCIMENTO}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
              <span className="text-slate-400">VALOR</span>
              <span className="text-emerald-700 font-black">{formatarMoeda(result.valor_gas || result.VALOR_GAS || formData.valor_gas)}</span>
            </div>
          </div>

          <div className="p-3 bg-white border-2 border-emerald-600 rounded-2xl mb-6">
            <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" referrerPolicy="no-referrer" />
          </div>
          
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                nome: '',
                telefone: '',
                valor_gas: '',
                qtd_gas: '1',
                prazo_dias: '30'
              });
            }}
            className="w-full h-[60px] bg-emerald-600 text-white font-black rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-200"
          >
            NOVO VALE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
        <div className="bg-white p-5 rounded-3xl shadow-lg border border-emerald-100 space-y-4">
          <h2 className="text-xl font-black text-emerald-800 tracking-tight mb-2">Informações do Vale</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</label>
              <input
                type="tel"
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                placeholder="(00) 0 0000-0000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor do Gás</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                  value={formData.valor_gas}
                  onChange={(e) => setFormData({ ...formData, valor_gas: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantidade</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                  value={formData.qtd_gas}
                  onChange={(e) => setFormData({ ...formData, qtd_gas: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prazo de Vencimento (Dias)</label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                value={formData.prazo_dias}
                onChange={(e) => setFormData({ ...formData, prazo_dias: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-bold mb-3 animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[65px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'GERAR VALE'}
          </button>
        </div>
      </form>
    </div>
  );
};
