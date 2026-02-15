
import React, { useState } from 'react';
import { Servico, Projeto, Cliente } from '../types';

interface ServiceManagerProps {
  servicos: Servico[];
  projetos: Projeto[];
  clientes: Cliente[];
  onUpdateServicos: (servicos: Servico[]) => void;
  onAddProjeto: (projeto: Projeto) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ servicos, projetos, clientes, onUpdateServicos, onAddProjeto }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [selectedServicoForProject, setSelectedServicoForProject] = useState<Servico | null>(null);

  const [newServico, setNewServico] = useState<Partial<Servico>>({
    nome: '',
    descricao: '',
    categoria: 'Instalação',
    precoBase: 0,
    prazoEstimadoDias: 30
  });

  const [newProject, setNewProject] = useState<Partial<Projeto>>({
    clienteId: '',
    responsavelExecucao: '',
  });

  const handleSaveServico = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServico) {
      onUpdateServicos(servicos.map(s => s.servicoId === editingServico.servicoId ? editingServico : s));
    } else {
      const id = `SERV_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      onUpdateServicos([...servicos, { ...newServico, servicoId: id } as Servico]);
    }
    setIsModalOpen(false);
    setEditingServico(null);
    setNewServico({ nome: '', descricao: '', categoria: 'Instalação', precoBase: 0, prazoEstimadoDias: 30 });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicoForProject || !newProject.clienteId) return;

    const projId = `PROJ_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const projeto: Projeto = {
      projetoId: projId,
      propostaId: 'MANUAL',
      clienteId: newProject.clienteId,
      servicoId: selectedServicoForProject.servicoId,
      dataAbertura: new Date().toLocaleDateString('pt-BR'),
      statusProjeto: 'Aguardando Início',
      responsavelExecucao: newProject.responsavelExecucao || 'Pendente',
      tipoProjeto: selectedServicoForProject.nome,
      valorContrato: selectedServicoForProject.precoBase
    };

    onAddProjeto(projeto);
    setIsProjectModalOpen(false);
    setSelectedServicoForProject(null);
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-svAnthracite p-8 rounded-[2rem] border border-white/5">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Serviços <span className="text-svSuccess">Comerciais</span></h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Catálogo de Ofertas Semper Vincit 2026</p>
        </div>
        <button 
          onClick={() => { setEditingServico(null); setIsModalOpen(true); }}
          className="px-8 py-3 bg-svSuccess text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
        >
          + Cadastrar Serviço
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {servicos.map((s) => (
          <div key={s.servicoId} className="dark-card p-8 rounded-[2rem] relative overflow-hidden group hover:border-svSuccess/30 transition-all border border-white/5">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-svSuccess">
                  {s.categoria}
                </span>
                <p className="text-xl font-black text-white italic">{formatCurrency(s.precoBase)}</p>
              </div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{s.nome}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 min-h-[40px] line-clamp-2">
                {s.descricao}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                   <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Prazo SLA</p>
                   <p className="text-sm font-bold">{s.prazoEstimadoDias} Dias</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                   <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Projetos Ativos</p>
                   <p className="text-sm font-bold">{projetos.filter(p => p.servicoId === s.servicoId).length}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedServicoForProject(s); setIsProjectModalOpen(true); }}
                  className="flex-1 py-3 bg-svBlue hover:bg-svBlue/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Novo Projeto
                </button>
                <button 
                  onClick={() => { setEditingServico(s); setIsModalOpen(true); }}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-svAnthracite rounded-[2rem] w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-black uppercase italic text-white">{editingServico ? 'Editar Serviço' : 'Cadastrar Serviço'}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Definição de Produto Comercial</p>
            </div>
            <form onSubmit={handleSaveServico} className="p-8 space-y-6">
              <div className="space-y-4">
                <input 
                  required placeholder="Nome do Serviço" 
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-svSuccess outline-none transition-all" 
                  value={editingServico ? editingServico.nome : newServico.nome}
                  onChange={e => editingServico ? setEditingServico({...editingServico, nome: e.target.value}) : setNewServico({...newServico, nome: e.target.value})}
                />
                <textarea 
                  required placeholder="Descrição Detalhada" 
                  rows={3}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-svSuccess outline-none transition-all" 
                  value={editingServico ? editingServico.descricao : newServico.descricao}
                  onChange={e => editingServico ? setEditingServico({...editingServico, descricao: e.target.value}) : setNewServico({...newServico, descricao: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Categoria</label>
                    <select 
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                      value={editingServico ? editingServico.categoria : newServico.categoria}
                      onChange={e => editingServico ? setEditingServico({...editingServico, categoria: e.target.value as any}) : setNewServico({...newServico, categoria: e.target.value as any})}
                    >
                      <option value="Instalação">Instalação</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Homologação">Homologação</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Preço Base (R$)</label>
                    <input 
                      type="number"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                      value={editingServico ? editingServico.precoBase : newServico.precoBase}
                      onChange={e => editingServico ? setEditingServico({...editingServico, precoBase: Number(e.target.value)}) : setNewServico({...newServico, precoBase: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Prazo Estimado (Dias)</label>
                  <input 
                    type="number"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                    value={editingServico ? editingServico.prazoEstimadoDias : newServico.prazoEstimadoDias}
                    onChange={e => editingServico ? setEditingServico({...editingServico, prazoEstimadoDias: Number(e.target.value)}) : setNewServico({...newServico, prazoEstimadoDias: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white/10 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-svSuccess text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-svSuccess/20">Salvar Serviço</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProjectModalOpen && selectedServicoForProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-svAnthracite rounded-[2rem] w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-black uppercase italic text-white">Criar Projeto Direto</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Serviço: {selectedServicoForProject.nome}</p>
            </div>
            <form onSubmit={handleCreateProject} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Vincular Cliente DIM</label>
                  <select 
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                    value={newProject.clienteId}
                    onChange={e => setNewProject({...newProject, clienteId: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.clienteId} value={c.clienteId}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Engenheiro Responsável</label>
                  <input 
                    placeholder="Nome do Responsável"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                    value={newProject.responsavelExecucao}
                    onChange={e => setNewProject({...newProject, responsavelExecucao: e.target.value})}
                  />
                </div>
                <div className="p-4 bg-svBlue/10 rounded-2xl border border-svBlue/20">
                   <p className="text-[10px] text-svBlue font-black uppercase tracking-widest mb-1">Resumo do Contrato</p>
                   <p className="text-sm font-bold">Valor: {formatCurrency(selectedServicoForProject.precoBase)}</p>
                   <p className="text-xs text-gray-400">Prazo SLA: {selectedServicoForProject.prazoEstimadoDias} Dias</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white/10 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-svBlue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-svBlue/20">Abrir Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
