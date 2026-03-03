import React, { useState } from 'react';
import { API_URL, VoucherData } from '../types';
import { cn } from '../utils';
import { Calendar, Phone, User, DollarSign, AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VoucherDetailsProps {
  data: VoucherData;
  onUpdate: (data: VoucherData) => void;
}

export const VoucherDetails: React.FC<VoucherDetailsProps> = ({ data, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = isAfter(new Date(), parseISO(data.DATA_VENCIMENTO));

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: data.ID_VALE,
          status: newStatus
        }),
      });

      // Refresh data
      setTimeout(async () => {
        const res = await fetch(`${API_URL}?id=${data.ID_VALE}`);
        const updated = await res.json();
        onUpdate(updated);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Erro ao atualizar status');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOVO': return 'bg-blue-500 text-white';
      case 'ATIVO': return 'bg-emerald-500 text-white';
      case 'FINALIZADO': return 'bg-slate-200 text-slate-600';
      case 'SUSPENSO': return 'bg-amber-500 text-white';
      case 'PERDIDO': return 'bg-orange-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  if (isExpired) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-red-600 rounded-3xl shadow-2xl text-center text-white animate-in fade-in zoom-in duration-300">
        <XCircle className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2 tracking-tighter">VALE VENCIDO</h1>
        <p className="opacity-90 mb-6 font-medium">Este vale expirou em {formatDate(data.DATA_VENCIMENTO)}</p>
        <div className="bg-white/10 p-4 rounded-2xl text-left space-y-2">
          <p className="text-sm font-bold opacity-70 uppercase tracking-widest">ID: {data.ID_VALE}</p>
          <p className="text-lg font-bold">{data.NOME}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID DO VALE</span>
            <h2 className="text-2xl font-black text-slate-900">{data.ID_VALE}</h2>
          </div>
          <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(data.STATUS))}>
            {data.STATUS}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</p>
              <p className="font-bold text-slate-800">{data.NOME} {data.APELIDO && <span className="text-slate-400 font-medium">({data.APELIDO})</span>}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone</p>
              <p className="font-bold text-slate-800">{data.TELEFONE || 'Não informado'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor do Gás</p>
              <p className="font-black text-2xl text-slate-900">R$ {Number(data.VALOR_GAS).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Card */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emissão</p>
            <p className="text-sm font-bold">{format(parseISO(data.DATA_EMISSAO), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento</p>
            <p className="text-sm font-bold text-orange-400">{format(parseISO(data.DATA_VENCIMENTO), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4">
        {data.STATUS === 'NOVO' && (
          <button
            onClick={() => updateStatus('ATIVO')}
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            ATIVAR VALE
          </button>
        )}

        {data.STATUS === 'ATIVO' && (
          <button
            onClick={() => updateStatus('FINALIZADO')}
            disabled={loading}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            FINALIZAR VALE
          </button>
        )}

        {data.STATUS === 'FINALIZADO' && (
          <div className="w-full py-5 bg-emerald-100 text-emerald-700 font-black text-center rounded-2xl border-2 border-emerald-200 flex items-center justify-center gap-3">
            <CheckCircle2 />
            VALE JÁ RESGATADO
          </div>
        )}

        {data.STATUS === 'SUSPENSO' && (
          <div className="w-full py-5 bg-amber-100 text-amber-700 font-black text-center rounded-2xl border-2 border-amber-200 flex items-center justify-center gap-3">
            <AlertTriangle />
            VALE SUSPENSO
          </div>
        )}

        {data.STATUS === 'PERDIDO' && (
          <div className="w-full py-5 bg-orange-100 text-orange-700 font-black text-center rounded-2xl border-2 border-orange-200 flex items-center justify-center gap-3">
            <AlertTriangle />
            VALE PERDIDO
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-red-500 font-bold text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};
