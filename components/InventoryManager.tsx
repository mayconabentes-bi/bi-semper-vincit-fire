
import React, { useState } from 'react';
import { ItemEstoque, MovimentacaoEstoque } from '../types';

interface InventoryManagerProps {
  items: ItemEstoque[];
  movements: MovimentacaoEstoque[];
  onAddMovement: (mov: MovimentacaoEstoque) => void;
  onAddItem: (item: ItemEstoque) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ items, movements, onAddMovement, onAddItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({
    itemId: '',
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    quantidade: 0,
    referenciaId: ''
  });

  const [newItem, setNewItem] = useState({
    nome: '',
    categoria: 'Painel' as any,
    unidade: 'UN',
    pontoPedido: 0
  });

  const calculateBalance = (itemId: string) => {
    const itemMovements = movements.filter(m => m.itemId === itemId);
    const entries = itemMovements.filter(m => m.tipo === 'Entrada').reduce((acc, m) => acc + m.quantidade, 0);
    const exits = itemMovements.filter(m => m.tipo === 'Saída').reduce((acc, m) => acc + m.quantidade, 0);
    return entries - exits;
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovement.itemId || newMovement.quantidade <= 0) return;
    
    onAddMovement({
      movId: `MOV_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      itemId: newMovement.itemId,
      tipo: newMovement.tipo,
      quantidade: newMovement.quantidade,
      data: new Date().toLocaleDateString('pt-BR'),
      referenciaId: newMovement.referenciaId
    });
    setIsModalOpen(false);
    setNewMovement({ itemId: '', tipo: 'Entrada', quantidade: 0, referenciaId: '' });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome) return;
    onAddItem({
      itemId: `ITM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...newItem
    });
    setIsItemModalOpen(false);
    setNewItem({ nome: '', categoria: 'Painel', unidade: 'UN', pontoPedido: 0 });
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md">
          <div>
            <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight italic">Gestão de Estoque (Inventory)</h3>
            <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Controle de Painéis, Inversores e Insumos</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setIsItemModalOpen(true)}
              className="px-4 py-2 bg-white border border-svBlue text-svBlue rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-svBlue/5 transition-all"
            >
              + Novo Item
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-svBlue text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
            >
              Movimentar Estoque
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Item</th>
                <th className="px-6 py-5">Categoria</th>
                <th className="px-6 py-5">Entradas</th>
                <th className="px-6 py-5">Saídas</th>
                <th className="px-6 py-5">Saldo Atual</th>
                <th className="px-6 py-5">Status / Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const balance = calculateBalance(item.itemId);
                const entries = movements.filter(m => m.itemId === item.itemId && m.tipo === 'Entrada').reduce((acc, m) => acc + m.quantidade, 0);
                const exits = movements.filter(m => m.itemId === item.itemId && m.tipo === 'Saída').reduce((acc, m) => acc + m.quantidade, 0);
                const isLow = balance <= item.pontoPedido;

                return (
                  <tr key={item.itemId} className="hover:bg-svBlue/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-svBlue">{item.nome}</p>
                      <p className="text-[10px] text-svGray font-mono uppercase">{item.itemId} • {item.unidade}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 uppercase">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                      +{entries}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-rose-500">
                      -{exits}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-base font-black ${isLow ? 'text-rose-600' : 'text-svBlue'}`}>
                        {balance} <span className="text-[10px] opacity-60 font-medium">{item.unidade}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <div className="flex items-center space-x-2 text-rose-600 animate-pulse">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">Abaixo do Ponto de Pedido ({item.pontoPedido})</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-emerald-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">Estoque OK</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <h4 className="text-sm font-black text-svBlue uppercase tracking-widest">Log Recente de Movimentações</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[9px] font-black text-svGray uppercase tracking-[0.2em] bg-gray-50/20">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-right">Qtd</th>
                <th className="px-6 py-3">Ref / Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...movements].reverse().slice(0, 10).map((m) => (
                <tr key={m.movId} className="text-xs">
                  <td className="px-6 py-3 text-svGray">{m.data}</td>
                  <td className="px-6 py-3 font-bold text-svBlue">{items.find(i => i.itemId === m.itemId)?.nome || m.itemId}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${m.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-black">{m.quantidade}</td>
                  <td className="px-6 py-3 font-mono text-[9px] text-svGray uppercase opacity-60">{m.referenciaId || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic tracking-tighter">Movimentação Interna</h3>
               <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Entradas e Saídas v9.9</p>
            </div>
            <form onSubmit={handleAddMovement} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Item</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={newMovement.itemId}
                  onChange={e => setNewMovement({...newMovement, itemId: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {items.map(i => <option key={i.itemId} value={i.itemId}>{i.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Tipo</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                    value={newMovement.tipo}
                    onChange={e => setNewMovement({...newMovement, tipo: e.target.value as any})}
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Quantidade</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                    value={newMovement.quantidade}
                    onChange={e => setNewMovement({...newMovement, quantidade: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Ref. (Ex: Projeto ou Compra)</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  value={newMovement.referenciaId}
                  onChange={e => setNewMovement({...newMovement, referenciaId: e.target.value})}
                  placeholder="ID do Vínculo"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svBlue text-white rounded-xl font-bold text-xs uppercase shadow-lg">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white text-center">
               <h3 className="font-bold text-lg uppercase italic">Novo Item de Catálogo</h3>
               <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Engine de Suprimentos v9.9</p>
            </div>
            <form onSubmit={handleAddItem} className="p-8 space-y-4">
              <input 
                placeholder="Nome do Item / Modelo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold" 
                value={newItem.nome}
                onChange={e => setNewItem({...newItem, nome: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Categoria</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                    value={newItem.categoria}
                    onChange={e => setNewItem({...newItem, categoria: e.target.value as any})}
                  >
                    <option value="Painel">Painel</option>
                    <option value="Inversor">Inversor</option>
                    <option value="Estrutura">Estrutura</option>
                    <option value="Cabo">Cabo</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Unidade</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    value={newItem.unidade}
                    onChange={e => setNewItem({...newItem, unidade: e.target.value})}
                    placeholder="Ex: UN, MT, KIT"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Ponto de Pedido (Alerta)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={newItem.pontoPedido}
                  onChange={e => setNewItem({...newItem, pontoPedido: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Cadastrar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
