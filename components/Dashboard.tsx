
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase';
import { KPIData, Venda, Lead, Proposta, PosVenda, LeadStatus, CustoOperacional } from '../src/types'; // Caminho corrigido
import { getDashboardSummary } from '../services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface DashboardProps {
  kpis: KPIData;
  leadsCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ kpis, leadsCount }) => {
  const [aiSummary, setAiSummary] = useState("Sincronizando Business Intelligence...");
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [custos, setCustos] = useState<CustoOperacional[]>([]);
  const [posVendas, setPosVendas] = useState<PosVenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const vendasSnapshot = await getDocs(collection(db, "vendas"));
      const vendasData = vendasSnapshot.docs.map(doc => ({ ...doc.data(), vendaId: doc.id })) as Venda[];
      setVendas(vendasData);

      const propostasSnapshot = await getDocs(collection(db, "propostas"));
      const propostasData = propostasSnapshot.docs.map(doc => ({ ...doc.data(), propostaId: doc.id })) as Proposta[];
      setPropostas(propostasData);

      const leadsSnapshot = await getDocs(collection(db, "leads"));
      const leadsData = leadsSnapshot.docs.map(doc => ({ ...doc.data(), leadId: doc.id })) as Lead[];
      setLeads(leadsData);

      const custosSnapshot = await getDocs(collection(db, "custos"));
      const custosData = custosSnapshot.docs.map(doc => ({ ...doc.data(), custoId: doc.id })) as CustoOperacional[];
      setCustos(custosData);

      const posVendasSnapshot = await getDocs(collection(db, "pos-venda"));
      const posVendasData = posVendasSnapshot.docs.map(doc => ({ ...doc.data(), posVendaId: doc.id })) as PosVenda[];
      setPosVendas(posVendasData);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      const summary = await getDashboardSummary(kpis, leadsCount);
      setAiSummary(summary || "Insights estratégicos indisponíveis.");
    };
    fetchSummary();
  }, [kpis, leadsCount]);

  const revenueHistory = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { month: d.getMonth(), year: d.getFullYear(), name: d.toLocaleString('default', { month: 'short' }) };
    }).reverse();

    return months.map(m => {
      const monthSales = vendas.filter(v => {
        const [day, month, year] = v.dataFechamento.split('/').map(Number);
        return month - 1 === m.month && year === m.year;
      });
      const totalRevenue = monthSales.reduce((acc, v) => acc + v.receita, 0);

      return {
        name: m.name,
        Receita: totalRevenue,
      };
    });
  }, [vendas]);

  const cacLtvData = useMemo(() => {
    const marketingCosts = custos.filter(c => c.categoria === 'Marketing').reduce((acc, c) => acc + c.valor, 0);
    const totalLeads = leads.length > 0 ? leads.length : 1;
    const cac = marketingCosts / totalLeads;

    const origens = Array.from(new Set(leads.map(l => l.origem)));
    return origens.map(o => {
      const leadsDaOrigem = leads.filter(l => l.origem === o);
      const vendasDaOrigem = vendas.filter(v => propostas.some(p => p.propostaId === v.propostaId && leads.some(l => l.leadId === p.leadId && l.origem === o)));
      const receitaTotal = vendasDaOrigem.reduce((acc, v) => acc + v.receita, 0);
      const ltv = leadsDaOrigem.length > 0 ? receitaTotal / leadsDaOrigem.length : 0;
      
      return {
        name: o,
        CAC: cac, // Use calculated CAC
        LTV: ltv
      };
    });
  }, [leads, vendas, propostas, custos]);

  const churnData = useMemo(() => {
    const weeks = Array.from({ length: 6 }, (_, i) => {
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        return { start, end, name: `W${6-i}` };
    }).reverse();

    return weeks.map(week => {
        const lostLeadsInWeek = leads.filter(lead => {
            if (lead.status === LeadStatus.PERDIDO) {
                const [day, month, year] = lead.dataEntrada.split('/').map(Number);
                const leadDate = new Date(year, month - 1, day);
                return leadDate >= week.start && leadDate <= week.end;
            }
            return false;
        });
        
        const totalLeadsInWeek = leads.filter(lead => {
             const [day, month, year] = lead.dataEntrada.split('/').map(Number);
             const leadDate = new Date(year, month - 1, day);
             return leadDate >= week.start && leadDate <= week.end;
        });

        const churnRate = totalLeadsInWeek.length > 0 ? (lostLeadsInWeek.length / totalLeadsInWeek.length) * 100 : 0;
        
        return {
            week: week.name,
            rate: parseFloat(churnRate.toFixed(1))
        };
    });
  }, [leads]);

  const npsData = useMemo(() => {
    const promotores = posVendas.filter(p => p.nps >= 9).length;
    const neutros = posVendas.filter(p => p.nps >= 7 && p.nps < 9).length;
    const detratores = posVendas.filter(p => p.nps < 7).length;
    const total = posVendas.length || 1;

    return [
      { name: 'Promotores', value: (promotores / total) * 100, color: '#27AE60' },
      { name: 'Neutros', value: (neutros / total) * 100, color: '#F1C40F' },
      { name: 'Detratores', value: (detratores / total) * 100, color: '#E74C3C' },
    ];
  }, [posVendas]);

  const funnelData = useMemo(() => {
    return [
      { label: 'Leads', val: leads.length, w: 'w-full', c: 'bg-svBlue' },
      { label: 'Qualificados', val: leads.filter(l => l.status !== LeadStatus.NOVO && l.status !== LeadStatus.PERDIDO).length, w: 'w-3/4', c: 'bg-svBlue/80' },
      { label: 'Propostas', val: propostas.length, w: 'w-1/2', c: 'bg-svGold' },
      { label: 'Vendas', val: vendas.length, w: 'w-1/3', c: 'bg-svSuccess' }
    ];
  }, [leads, propostas, vendas]);

  const avgNps = useMemo(() => {
    if (posVendas.length === 0) return 0;
    return posVendas.reduce((acc, p) => acc + p.nps, 0) / posVendas.length;
  }, [posVendas]);

  const goalValue = 500000;
  const currentProgress = (kpis.receitaTotal / goalValue) * 100;
  const gaugeData = [
    { value: kpis.receitaTotal },
    { value: Math.max(0, goalValue - kpis.receitaTotal) }
  ];

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;

  const Sparkline = ({ data }: { data: any[] }) => (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="v" stroke="#27AE60" fill="#27AE60" fillOpacity={0.1} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (isLoading) {
    return <div>Carregando...</div>; 
  }

  return (
    <div className="space-y-6 animate-fadeIn bg-svAnthracite p-8 rounded-[2rem] text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-svSuccess to-svBlue flex items-center justify-center shadow-lg shadow-svSuccess/20">
             <span className="font-black text-xl italic tracking-tighter">26</span>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Intelligence <span className="text-svSuccess">Unit</span></h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Painel de Decisão Semper Vincit 2026</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Tempo Real', 'BU: Solar Global', 'Sincronizado'].map(filter => (
            <button key={filter} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Bruta', val: formatCurrency(kpis.receitaTotal), sub: `Progresso Meta: ${currentProgress.toFixed(1)}%`, color: 'text-svSuccess' },
          { label: 'Volume Vendas', val: kpis.totalVendas, sub: `Ticket Médio: ${formatCurrency(kpis.ticketMedio)}`, color: 'text-svGold' },
          { label: 'Conversão Lead-Venda', val: `${(kpis.taxaConversao * 100).toFixed(1)}%`, sub: 'Benchmark SV: 12%', color: 'text-svSuccess' },
          { label: 'Leads no Funil', val: leadsCount, sub: `Qualificados: ${leads.filter(l => l.status === LeadStatus.QUALIFICADO).length}`, color: 'text-svGold' }
        ].map((k, i) => (
          <div key={i} className="dark-card p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{k.label}</p>
                <h3 className={`text-2xl font-black ${k.color}`}>{k.val}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{k.sub}</p>
              </div>
              <Sparkline data={[{v: 10}, {v: 25}, {v: 15}, {v: 40}, {v: 30}]} />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-svSuccess/20 to-transparent w-full"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Progress Gauge */}
        <div className="col-span-12 lg:col-span-4 dark-card p-8 rounded-[2rem] flex flex-col items-center justify-center">
           <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Realização Comercial (vs Meta)</p>
           <div className="relative w-full h-48 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={gaugeData}
                   cx="50%"
                   cy="80%"
                   startAngle={180}
                   endAngle={0}
                   innerRadius={70}
                   outerRadius={100}
                   paddingAngle={0}
                   dataKey="value"
                 >
                   <Cell fill="#27AE60" />
                   <Cell fill="rgba(255,255,255,0.05)" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                <span className="text-4xl font-black">{currentProgress.toFixed(0)}%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Realizado</span>
             </div>
           </div>
        </div>

        {/* Historical Area */}
        <div className="col-span-12 lg:col-span-8 dark-card p-8 rounded-[2rem]">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 italic">Performance Mensal Acumulada</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="Receita" stackId="1" stroke="#1b3a82" fill="#1b3a82" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        <div className="col-span-12 lg:col-span-4 dark-card p-8 rounded-[2rem]">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8">Saúde do Funil (Real)</h3>
          <div className="space-y-4">
            {funnelData.map((f, i) => (
              <div key={i} className="flex items-center space-x-4">
                <span className="w-20 text-[9px] font-black uppercase text-gray-500">{f.label}</span>
                <div className="flex-1">
                  <div className={`h-8 ${f.w} ${f.c} rounded-r-xl flex items-center px-4 transition-all hover:brightness-110`}>
                    <span className="text-[10px] font-black">{f.val}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAC vs LTV */}
        <div className="col-span-12 lg:col-span-5 dark-card p-8 rounded-[2rem]">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 italic">ROI por Origem (CAC vs LTV)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cacLtvData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="CAC" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LTV" fill="#27AE60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPS */}
        <div className="col-span-12 lg:col-span-3 dark-card p-6 rounded-[2rem] flex flex-col items-center justify-center">
             <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 self-start">NPS (Customer Success)</h3>
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={npsData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                       {npsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-2 text-center">
                <span className="text-xl font-black text-svSuccess">{avgNps.toFixed(1)}</span>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Média Geral Pós-Venda</p>
             </div>
        </div>

      </div>

      {/* AI Intelligence Layer */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 dark-card p-8 rounded-[2rem] border-l-4 border-svSuccess">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-svSuccess flex items-center justify-center">
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest italic tracking-tighter">Insights AI Gemini <span className="text-svSuccess">Análise Operacional</span></h3>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-xs text-gray-300 leading-relaxed italic">
               "{aiSummary}"
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
