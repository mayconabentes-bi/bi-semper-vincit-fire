
import React, { useState } from 'react';
import { VisitaTecnica, Lead } from '../types';

interface VisitaManagerProps {
  visitas: VisitaTecnica[];
  leads: Lead[];
  onUpdateVisita?: (visita: VisitaTecnica) => void;
}

const VisitaManager: React.FC<VisitaManagerProps> = ({ visitas, leads, onUpdateVisita }) => {
  const [editingVisita, setEditingVisita] = useState<VisitaTecnica | null>(null);

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.leadId === leadId)?.nome || "Lead Desconhecido";
  };

  const getViabilidadeBadge = (viabilidade: string) => {
    switch (viabilidade) {
      case 'Viável': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inviável': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisita && onUpdateVisita) {
      onUpdateVisita(editingVisita);
      setEditingVisita(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight">3. Visitas Técnicas</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Log de Vistoria e Viabilidade</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Visita ID</th>
              <th className="px-6 py-5">Lead / Nome</th>
              <th className="px-6 py-5">Data/Hora</th>
              <th className="px-6 py-5">Técnico</th>
              <th className="px-6 py-5 text-center">Viabilidade</th>
              <th className="px-6 py-5">Complexidade</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/30">
            {visitas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">
                  Nenhuma visita técnica agendada.
                </td>
              </tr>
            ) : (
              visitas.map((v) => (
                <tr key={v.visitaId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-lg text-svGray border border-gray-200">
                      {v.visitaId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-svBlue">{getLeadName(v.leadId)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700">
                    {v.dataVisita}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {v.tecnico}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${getViabilidadeBadge(v.viabilidade)}`}>
                      {v.viabilidade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-svGray italic">
                      {v.complexidade || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingVisita(v)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Atualizar Parecer Técnico</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Viabilidade Semper Vincit</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Status de Viabilidade</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={editingVisita.viabilidade}
                  onChange={e => setEditingVisita({...editingVisita, viabilidade: e.target.value as any})}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Viável">Viável</option>
                  <option value="Inviável">Inviável</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Complexidade da Instalação</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={editingVisita.complexidade}
                  onChange={e => setEditingVisita({...editingVisita, complexidade: e.target.value})}
                >
                  <option value="Nível 1 - Baixa">Nível 1 - Baixa</option>
                  <option value="Nível 2 - Média">Nível 2 - Média</option>
                  <option value="Nível 3 - Alta">Nível 3 - Alta</option>
                  <option value="Nível 4 - Crítica">Nível 4 - Crítica</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Observações Técnicas</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  rows={3}
                  value={editingVisita.observacoes}
                  onChange={e => setEditingVisita({...editingVisita, observacoes: e.target.value})}
                  placeholder="Descreva detalhes estruturais..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingVisita(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svBlue text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Visita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitaManager;
