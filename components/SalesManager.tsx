
import React, { useState } from 'react';
import { Venda, Lead, Proposta } from '../types';

interface SalesManagerProps {
  vendas: Venda[];
  propostas: Proposta[];
  leads: Lead[];
  // Added onUpdateVenda prop to fix TypeScript error in App.tsx
  onUpdateVenda?: (venda: Venda) => void;
}

const SalesManager: React.FC<SalesManagerProps> = ({ vendas, propostas, leads, onUpdateVenda }) => {
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);

  const getLeadNameByProposal = (propostaId: string) => {
    const prop = propostas.find(p => p.propostaId === propostaId);
    if (!prop) return "N/A";
    return leads.find(l => l.leadId === prop.leadId)?.nome || "Cliente Desconhecido";
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalReceita = vendas.reduce((acc, v) => acc + v.receita, 0);
  const totalRecebido = vendas.reduce((acc, v) => acc + v.receitaRecebida, 0);
  const pendencia = totalReceita - totalRecebido;

  // Added handleSave to process updates via the new onUpdateVenda prop
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVenda && onUpdateVenda) {
      onUpdateVenda(editingVenda);
      setEditingVenda(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight">7. Fluxo de Vendas (Fechamento)</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Monitoramento de Conversão e Receita</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Receita Total</p>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(totalReceita)}</p>
           </div>
           <div className="px-4 py-2 bg-svBlue/5 border border-svBlue/10 rounded-xl">
              <p className="text-[9px] font-black text-svBlue uppercase tracking-widest">Total Recebido</p>
              <p className="text-lg font-black text-svBlue">{formatCurrency(totalRecebido)}</p>
           </div>
           {pendencia > 0 && (
             <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">A Receber</p>
                <p className="text-lg font-black text-amber-700">{formatCurrency(pendencia)}</p>
             </div>
           )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Venda ID</th>
              <th className="px-6 py-5">Proposta / Cliente</th>
              <th className="px-6 py-5">Receita Bruta</th>
              <th className="px-6 py-5">Data Fechamento</th>
              <th className="px-6 py-5">Pagamento</th>
              <th className="px-6 py-5">Parcelas</th>
              <th className="px-6 py-5">Receita Recebida</th>
              <th className="px-6 py-5 text-right">Status Financeiro</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">
                  Nenhuma venda concretizada na base Semper Vincit v9.9.
                </td>
              </tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.vendaId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded text-svGray">
                      {v.vendaId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-svBlue">{getLeadNameByProposal(v.propostaId)}</p>
                    <p className="text-[9px] font-mono text-svGray">REF: {v.propostaId}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">
                    {formatCurrency(v.receita)}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {v.dataFechamento}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-svBlue uppercase">
                      {v.formaPagamento}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {v.parcelas}x
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                    {formatCurrency(v.receitaRecebida)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {v.receita === v.receitaRecebida ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-black uppercase">Liquidado</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase">Em Aberto</span>
                    )}
                    <p className="text-[9px] text-svGray mt-1 italic">Ult. Rec.: {v.dataUltimoRecebimento}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingVenda(v)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingVenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Atualizar Recebimento</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Controle Financeiro v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Forma Pagamento</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingVenda.formaPagamento} onChange={e => setEditingVenda({...editingVenda, formaPagamento: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Parcelas</label>
                  <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingVenda.parcelas} onChange={e => setEditingVenda({...editingVenda, parcelas: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Receita Recebida (R$)</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingVenda.receitaRecebida} onChange={e => setEditingVenda({...editingVenda, receitaRecebida: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Data Último Recebimento</label>
                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingVenda.dataUltimoRecebimento} onChange={e => setEditingVenda({...editingVenda, dataUltimoRecebimento: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingVenda(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
         <p className="text-[10px] font-black text-svGray uppercase tracking-widest italic">
            * Dados integrados com o Log de Auditoria Financeira SV
         </p>
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black text-svBlue uppercase tracking-widest">Motor Vendas v9.9</p>
         </div>
      </div>
    </div>
  );
};

export default SalesManager;
