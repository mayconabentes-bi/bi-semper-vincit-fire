
import React from 'react';
import { Venda, CustoOperacional, Compra, Projeto, Cliente } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CashFlowManagerProps {
  vendas: Venda[];
  custos: CustoOperacional[];
  purchases: Compra[];
  projetos: Projeto[];
  clientes: Cliente[];
}

const CashFlowManager: React.FC<CashFlowManagerProps> = ({ vendas, custos, purchases, projetos, clientes }) => {
  const TAX_RATE = 0.15; // Alíquota estimada de 15% (Impostos)

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Agregação Global
  const receitaTotal = vendas.reduce((acc, v) => acc + v.receita, 0);
  
  // Custos Operacionais (Mão de obra + Deslocamento + Outros, sem materiais pois materiais vêm de Compras)
  const operacionatTotal = custos.reduce((acc, c) => acc + (c.custoMaoObra + c.custoDeslocamento + c.outrosCustos), 0);
  
  // Compras (Materiais)
  const comprasTotal = purchases
    .filter(p => p.statusEntrega !== 'Cancelado')
    .reduce((acc, p) => acc + p.valorTotal, 0);
    
  const impostosTotal = receitaTotal * TAX_RATE;
  const totalSaidas = operacionatTotal + comprasTotal + impostosTotal;
  const lucroRealizado = receitaTotal - totalSaidas;
  const margemGeral = receitaTotal > 0 ? (lucroRealizado / receitaTotal) * 100 : 0;

  const chartData = [
    {
      name: 'Fluxo Global',
      Entradas: receitaTotal,
      Saídas: totalSaidas,
      Lucro: lucroRealizado,
    }
  ];

  const getClientName = (projetoId: string) => {
    const proj = projetos.find(p => p.projetoId === projetoId);
    if (!proj) return "N/A";
    return clientes.find(c => c.clienteId === proj.clienteId)?.nome || "Desconhecido";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border-l-4 border-emerald-500 shadow-sm">
          <p className="text-[10px] font-black text-svGray uppercase tracking-widest mb-1">Total Entradas</p>
          <h3 className="text-2xl font-black text-svBlue">{formatCurrency(receitaTotal)}</h3>
          <p className="text-[9px] text-emerald-600 font-bold">Base: 7.VENDAS</p>
        </div>
        
        <div className="glass-card p-6 rounded-3xl border-l-4 border-rose-500 shadow-sm">
          <p className="text-[10px] font-black text-svGray uppercase tracking-widest mb-1">Total Saídas</p>
          <h3 className="text-2xl font-black text-svBlue">{formatCurrency(totalSaidas)}</h3>
          <p className="text-[9px] text-rose-600 font-bold">Custos + Compras + Impostos</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-svBlue shadow-sm">
          <p className="text-[10px] font-black text-svGray uppercase tracking-widest mb-1">Lucro Realizado</p>
          <h3 className="text-2xl font-black text-svBlue">{formatCurrency(lucroRealizado)}</h3>
          <p className="text-[9px] text-svBlue font-bold">EBITDA Estimado</p>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-svBlue to-svCopper text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Margem Líquida Realizada</p>
            <h3 className="text-3xl font-black">{margemGeral.toFixed(1)}%</h3>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-3">
              <div 
                className="h-full bg-white rounded-full" 
                style={{ width: `${Math.max(0, Math.min(100, margemGeral))}%` }}
              ></div>
            </div>
          </div>
          <svg className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
          <h4 className="text-sm font-black text-svBlue uppercase tracking-widest mb-6 italic">Balanço de Caixa</h4>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lucro" fill="#1b3a82" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
             <p className="text-[10px] text-svGray font-bold uppercase leading-tight">
               * O cálculo considera uma reserva de {(TAX_RATE * 100)}% para impostos sobre o faturamento bruto.
             </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white/50">
            <h4 className="text-sm font-black text-svBlue uppercase tracking-widest">Auditoria de Projetos</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[9px] font-black text-svGray uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Projeto / Cliente</th>
                  <th className="px-6 py-4">Receita</th>
                  <th className="px-6 py-4">Custos + Compras</th>
                  <th className="px-6 py-4">Margem Líquida</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {custos.map((custo) => {
                  const proj = projetos.find(p => p.projetoId === custo.projetoId);
                  const venda = vendas.find(v => v.propostaId === proj?.propostaId);
                  const receita = venda?.receita || 0;
                  const saidas = custo.custoTotal; // custoTotal já inclui custoMaterial (compras) + operacionais
                  const impostos = receita * TAX_RATE;
                  const lucroProj = receita - (saidas + impostos);
                  const margemProj = receita > 0 ? (lucroProj / receita) * 100 : 0;

                  return (
                    <tr key={custo.projetoId} className="hover:bg-svBlue/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-svBlue">{getClientName(custo.projetoId)}</p>
                        <p className="text-[9px] font-mono text-svGray uppercase">{custo.projetoId}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600">
                        {formatCurrency(receita)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-svGray">
                        {formatCurrency(saidas + impostos)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-black ${margemProj > 20 ? 'text-emerald-600' : margemProj > 10 ? 'text-svGold' : 'text-rose-600'}`}>
                          {margemProj.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {margemProj > 20 ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded">Saudável</span>
                        ) : margemProj > 10 ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded">Atenção</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-black uppercase rounded">Crítico</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowManager;
