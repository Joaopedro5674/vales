import React, { useState } from 'react';
import { API_URL, VoucherData } from '../types';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface VoucherFormProps {
  id: string;
  onSuccess: (data: VoucherData) => void;
}

export const VoucherForm: React.FC<VoucherFormProps> = ({ id, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    apelido: '',
    telefone: '',
    contato: 'NÃO',
    valor: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor) {
      setError('Nome e Valor são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Google Apps Script POST often needs to be sent as text/plain to avoid CORS preflight issues
      // but the user specified POST. We'll try standard JSON first.
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script requires no-cors for POST redirects or specific handling
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          id,
          ...formData
        }),
      });

      // Since mode is 'no-cors', we can't read the response body.
      // We'll wait a bit and then trigger a refresh by calling the GET API
      setTimeout(async () => {
        const checkRes = await fetch(`${API_URL}?id=${id}`);
        const checkData = await checkRes.json();
        if (checkData.existe) {
          onSuccess(checkData);
        } else {
          setError('Erro ao criar vale. Tente novamente.');
          setLoading(false);
        }
      }, 2000);

    } catch (err) {
      setError('Erro de conexão com a API');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Novo Vale: {id}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
          <input
            type="text"
            required
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: João Silva"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Apelido</label>
          <input
            type="text"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.apelido}
            onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
            placeholder="Ex: Joãozinho"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</label>
          <input
            type="tel"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contato Pessoal?</label>
          <select
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
            value={formData.contato}
            onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
          >
            <option value="SIM">SIM</option>
            <option value="NÃO">NÃO</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valor do Gás (R$)</label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            placeholder="0.00"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CRIAR VALE'}
        </button>
      </form>
    </div>
  );
};
