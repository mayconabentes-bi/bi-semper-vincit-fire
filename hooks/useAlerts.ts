
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase';
import { AlertaSLA, Lead, LeadStatus, Proposta, ItemEstoque, MovimentacaoEstoque, Compra } from '../src/types';

// O hook agora aceita um parâmetro `isReady`
export const useAlerts = (isReady: boolean) => {
  const [alertas, setAlertas] = useState<AlertaSLA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAndGenerateAlerts = async () => {
      setIsLoading(true);

      // Busca os dados de todas as coleções necessárias
      const leadsSnapshot = await getDocs(collection(db, "leads"));
      const leads = leadsSnapshot.docs.map(doc => ({ ...doc.data(), leadId: doc.id })) as Lead[];

      const propostasSnapshot = await getDocs(collection(db, "propostas"));
      const propostas = propostasSnapshot.docs.map(doc => ({ ...doc.data(), propostaId: doc.id })) as Proposta[];

      const itemsSnapshot = await getDocs(collection(db, "estoque"));
      const items = itemsSnapshot.docs.map(doc => ({ ...doc.data(), itemId: doc.id })) as ItemEstoque[];

      const movementsSnapshot = await getDocs(collection(db, "movimentacoesEstoque"));
      const movements = movementsSnapshot.docs.map(doc => ({ ...doc.data(), movimentacaoId: doc.id })) as MovimentacaoEstoque[];

      const purchasesSnapshot = await getDocs(collection(db, "compras"));
      const purchases = purchasesSnapshot.docs.map(doc => ({ ...doc.data(), compraId: doc.id })) as Compra[];
      
      const novosAlertas: AlertaSLA[] = [];
      const hoje = new Date();

      // ... (toda a lógica de geração de alertas permanece a mesma) ...
            // ALERTA 1: Leads sem follow-up
      leads.forEach(lead => {
        if (lead.status === LeadStatus.NOVO) {
          const parts = lead.dataEntrada.split('/');
          const dataEntrada = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const diasSemAcao = Math.floor((hoje.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
          if (diasSemAcao > 7) {
            const id = `SLA_LEAD_${lead.leadId}`;
            novosAlertas.push({
              alertaId: id,
              tipo: 'LEAD_SEM_FOLLOW_UP',
              severidade: diasSemAcao > 14 ? 'critica' : 'alta',
              referencia: lead.leadId,
              mensagem: `Lead "${lead.nome}" sem atividade há ${diasSemAcao} dias`,
              dataAlerta: new Date().toLocaleString('pt-BR'),
              resolvido: resolvedIds.has(id)
            });
          }
        }
      });

      // ALERTA 2: Propostas sem resposta
      propostas.forEach(prop => {
        if (prop.status === 'Enviada') {
          const parts = prop.dataEnvio.split(' ')[0].split('/');
          const dataEnvio = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const diasSemResposta = Math.floor((hoje.getTime() - dataEnvio.getTime()) / (1000 * 60 * 60 * 24));
          if (diasSemResposta > 15) {
            const id = `SLA_PROP_${prop.propostaId}`;
            novosAlertas.push({
              alertaId: id,
              tipo: 'PROPOSTA_EXPIRADA',
              severidade: diasSemResposta > 30 ? 'critica' : 'media',
              referencia: prop.propostaId,
              mensagem: `Proposta "${prop.propostaId}" sem resposta há ${diasSemResposta} dias`,
              dataAlerta: new Date().toLocaleString('pt-BR'),
              resolvido: resolvedIds.has(id)
            });
          }
        }
      });

      // ALERTA 3: Estoque baixo
      items.forEach(item => {
        const balance = movements
          .filter(m => m.itemId === item.itemId)
          .reduce((acc, m) => acc + (m.tipo === 'Entrada' ? m.quantidade : -m.quantidade), 0);
        if (balance <= item.pontoPedido) {
          const id = `SLA_STOCK_${item.itemId}`;
          novosAlertas.push({
            alertaId: id,
            tipo: 'ESTOQUE_BAIXO',
            severidade: balance <= 0 ? 'critica' : 'alta',
            referencia: item.itemId,
            mensagem: `Estoque de "${item.nome}" em nível crítico: ${balance} ${item.unidade}`,
            dataAlerta: new Date().toLocaleString('pt-BR'),
            resolvido: resolvedIds.has(id)
          });
        }
      });

      // ALERTA 4: Compras pendentes
      purchases.forEach(purchase => {
        if (purchase.statusEntrega === 'Pendente') {
          const parts = purchase.dataPedido.split('/');
          const dataPedido = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const diasPendente = Math.floor((hoje.getTime() - dataPedido.getTime()) / (1000 * 60 * 60 * 24));
          if (diasPendente > 20) {
            const id = `SLA_PURCHASE_${purchase.compraId}`;
            novosAlertas.push({
              alertaId: id,
              tipo: 'COMPRA_PENDENTE',
              severidade: 'media',
              referencia: purchase.compraId,
              mensagem: `Compra "${purchase.compraId}" com fornecedor pendente há ${diasPendente} dias`,
              dataAlerta: new Date().toLocaleString('pt-BR'),
              resolvido: resolvedIds.has(id)
            });
          }
        }
      });


      setAlertas(novosAlertas);
      setIsLoading(false);
    };

    // A CONDIÇÃO: Só executa a função se a aplicação estiver pronta.
    if (isReady) {
      fetchAndGenerateAlerts();
      const interval = setInterval(fetchAndGenerateAlerts, 600000); // Re-check every 10 minutes
      return () => clearInterval(interval);
    } else {
      // Se não estiver pronto, garante que o estado de loading seja o correto.
      setIsLoading(false);
    }
  }, [isReady, resolvedIds]); // Adicionado isReady como dependência

  const resolverAlerta = useCallback((alertaId: string) => {
    setResolvedIds(prev => new Set(prev).add(alertaId));
  }, []);

  return { alertas, resolverAlerta, isLoading };
};
