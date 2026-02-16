
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Lead, LeadStatus, Usuario } from '../src/types';
import { getLeadInsights } from '../services/geminiService';
import { PERMISSIONS_MATRIX } from '../src/constants/permissions';

interface LeadManagerProps {
  currentUser: Usuario;
}

const LeadManager: React.FC<LeadManagerProps> = ({ currentUser }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const permissions = PERMISSIONS_MATRIX[currentUser.role]?.leads;

  const [newLead, setNewLead] = useState({
    nome: '',
    email: '',
    cidade: '',
    bairro: '',
    cepId: '',
    responsavel: 'Maycon',
    origem: 'Google Ads',
    contatoPessoa: '',
    tel1: ''
  });

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      const leadsCollection = collection(db, 'leads');
      const leadSnapshot = await getDocs(leadsCollection);
      const leadList = leadSnapshot.docs.map(doc => ({ ...doc.data(), leadId: doc.id }) as Lead);
      setLeads(leadList);
      setIsLoading(false);
    };

    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (!permissions.editar) return;
    const leadDocRef = doc(db, 'leads', leadId);
    await updateDoc(leadDocRef, { status: newStatus });
    setLeads(leads.map(l => l.leadId === leadId ? { ...l, status: newStatus } : l));
  };

  const showAiInsights = async (lead: Lead) => {
    setSelectedLead(lead);
    setAiTip(null);
    setLoadingAi(true);
    const tip = await getLeadInsights(lead);
    setAiTip(tip || "Sem dicas.");
    setLoadingAi(false);
  };

  const handleAddOrEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      if (!permissions.editar) return;
      const leadDocRef = doc(db, 'leads', editingLead.leadId);
      const { leadId, ...leadData } = editingLead;
      await updateDoc(leadDocRef, leadData);
      setLeads(leads.map(l => l.leadId === editingLead.leadId ? editingLead : l));
    } else {
      if (!permissions.criar) return;
      const leadData: Omit<Lead, 'leadId'> = {
        ...newLead,
        clienteId: '',
        cnpj: '',
        cpf: '',
        endereco: '',
        dataEntrada: new Date().toLocaleDateString('pt-BR'),
        status: LeadStatus.NOVO,
        score: 'Frio',
        slaQualificacao: 'Em Conformidade',
        tel2: ''
      };
      const docRef = await addDoc(collection(db, 'leads'), leadData);
      setLeads([...leads, { ...leadData, leadId: docRef.id }]);
    }
    setIsModalOpen(false);
    setEditingLead(null);
    setNewLead({
      nome: '', email: '', cidade: '', bairro: '', cepId: '', responsavel: 'Maycon', origem: 'Google Ads', contatoPessoa: '', tel1: ''
    });
  };

  const openEditModal = (lead: Lead) => {
    if (!permissions.editar) return;
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!permissions.deletar) {
      alert("Permissão negada para exclusão.");
      return;
    }
    if (window.confirm("Deseja realmente excluir este lead?")) {
      await deleteDoc(doc(db, "leads", leadId));
      setLeads(leads.filter(l => l.leadId !== leadId));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando leads...</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-bold text-svBlue">1. Funil de Leads</h3>
            <p className="text-[10px] text-svGray font-bold uppercase tracking-widest mt-0.5">Gestão Ativa Semper Vincit</p>
          </div>
          {permissions.criar && (
            <button 
              onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
              className="px-6 py-2.5 bg-svBlue text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-svBlue/90 transition-all active:scale-95"
            >
              + Novo Lead
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50/50 text-[10px] font-bold text-svGray uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Local / Origem</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status Funil</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.leadId} className="hover:bg-svBlue/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{lead.nome}</p>
                    <p className="text-[10px] text-svGray">{lead.email} • {lead.tel1}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-svBlue font-bold">{lead.cidade}</p>
                    <p className="text-[10px] text-svGray font-medium">{lead.origem}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <span className={`w-2 h-2 rounded-full ${lead.score === 'Quente' ? 'bg-orange-500' : lead.score === 'Morno' ? 'bg-yellow-500' : 'bg-blue-300'}`}></span>
                       <span className="text-xs font-bold text-gray-700">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      disabled={!permissions.editar}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.leadId, e.target.value as LeadStatus)}
                      className="text-[11px] font-bold rounded-lg border-gray-200 bg-white py-1 px-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Object.values(LeadStatus).map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                    <button onClick={() => showAiInsights(lead)} className="p-2 text-svCopper hover:bg-svCopper/10 rounded-lg transition-all" title="IA Insights">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                    {permissions.editar && (
                      <button onClick={() => openEditModal(lead)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg transition-all" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    )}
                    {permissions.deletar && (
                      <button onClick={() => handleDeleteLead(lead.leadId)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Excluir">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl h-fit border-t-4 border-t-svCopper shadow-xl">
        {selectedLead ? (
          <div className="animate-fadeIn">
            <h4 className="font-bold text-svBlue text-lg mb-1">{selectedLead.nome}</h4>
            <p className="text-[10px] text-svGray font-bold uppercase tracking-widest mb-6">Diagnóstico v9.9</p>
            <div className="p-5 bg-svBlue/5 border border-svBlue/10 rounded-2xl">
              {loadingAi ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-svBlue/10 rounded w-full"></div>
                  <div className="h-3 bg-svBlue/10 rounded w-11/12"></div>
                </div>
              ) : (
                <div className="text-xs text-svBlue leading-relaxed font-medium italic">{aiTip}</div>
              )}
            </div>
            <button onClick={() => setSelectedLead(null)} className="mt-4 text-[10px] font-bold text-svGray uppercase underline">Fechar Diagnóstico</button>
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
            <p className="text-xs font-bold text-svGray italic">Selecione o ícone de Raio para análise estratégica IA.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 gradient-sv text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold uppercase italic">{editingLead ? 'Editar Registro' : 'Novo Lead'}</h3>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Motor Comercial v9.9</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddOrEditLead} className="p-8 space-y-4">
              <input 
                required placeholder="Nome do Lead / Empresa" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" 
                value={editingLead ? editingLead.nome : newLead.nome}
                onChange={e => editingLead ? setEditingLead({...editingLead, nome: e.target.value}) : setNewLead({...newLead, nome: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Cidade" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingLead ? editingLead.cidade : newLead.cidade} onChange={e => editingLead ? setEditingLead({...editingLead, cidade: e.target.value}) : setNewLead({...newLead, cidade: e.target.value})} />
                <input placeholder="CEP" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingLead ? editingLead.cepId : newLead.cepId} onChange={e => editingLead ? setEditingLead({...editingLead, cepId: e.target.value}) : setNewLead({...newLead, cepId: e.target.value})} />
              </div>
              <input placeholder="E-mail" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingLead ? editingLead.email : newLead.email} onChange={e => editingLead ? setEditingLead({...editingLead, email: e.target.value}) : setNewLead({...newLead, email: e.target.value})} />
              <input placeholder="Telefone" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingLead ? editingLead.tel1 : newLead.tel1} onChange={e => editingLead ? setEditingLead({...editingLead, tel1: e.target.value}) : setNewLead({...newLead, tel1: e.target.value})} />
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManager;
