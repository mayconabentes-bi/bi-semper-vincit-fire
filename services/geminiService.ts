
// import { GoogleGenAI, Type } from "@google/genai";
import { Lead, KPIData } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLeadInsights(lead: Lead): Promise<string> {
  // try {
  //   const response = await ai.models.generateContent({
  //     model: "gemini-3-flash-preview",
  //     contents: `Analise o seguinte lead de energia solar e forneça 3 dicas estratégicas para conversão em formato de lista Markdown. 
  //     Nome: ${lead.nome}
  //     Local: ${lead.cidade}, ${lead.bairro}
  //     Status Atual: ${lead.status}
  //     Data de Entrada: ${lead.dataEntrada}`,
  //     config: {
  //       systemInstruction: "Você é um consultor sênior de vendas de energia solar da Semper Vincit. Seja profissional, direto e foque em ROI e sustentabilidade.",
  //     }
  //   });
  //   return response.text;
  // } catch (error) {
  //   console.error("Gemini Error:", error);
  //   return "Não foi possível gerar insights no momento.";
  // }
  return Promise.resolve("Insights de IA temporariamente desativados para o lançamento.");
}

export async function getDashboardSummary(kpis: KPIData, leadsCount: number): Promise<string> {
  // try {
  //   const response = await ai.models.generateContent({
  //     model: "gemini-3-flash-preview",
  //     contents: `Resuma o desempenho atual da Semper Vincit:
  //     - Faturamento: R$ ${kpis.receitaTotal.toLocaleString('pt-BR')}
  //     - Total Vendas: ${kpis.totalVendas}
  //     - Leads Ativos: ${leadsCount}
  //     - Taxa de Conversão: ${(kpis.taxaConversao * 100).toFixed(2)}%
  //     Dê um parágrafo de análise de saúde do negócio.`,
  //     config: {
  //       systemInstruction: "Você é um analista de BI focado em KPIs operacionais.",
  //     }
  //   });
  //   return response.text;
  // } catch (error) {
  //   return "Resumo indisponível.";
  // }
  return Promise.resolve("Análise de IA do dashboard desativada para o lançamento. Todos os KPIs estão operando normalmente.");
}

export async function generateNotificationTemplate(contexto: string, canal: string): Promise<string> {
  // try {
  //   const response = await ai.models.generateContent({
  //     model: "gemini-3-flash-preview",
  //     contents: `Gere uma mensagem persuasiva e profissional para o canal ${canal} baseada no seguinte contexto: "${contexto}". 
  //     A mensagem deve ser enviada pela empresa "Semper Vincit Solar". 
  //     Se for WhatsApp, use emojis moderadamente. Se for E-mail, inclua um assunto.`,
  //     config: {
  //       systemInstruction: "Você é um especialista em copy para vendas e customer success no setor de energia renovável.",
  //     }
  //   });
  //   return response.text;
  // } catch (error) {
  //   return "Erro ao gerar template inteligente.";
  // }
   return Promise.resolve("Templates de IA desativados para o lançamento.");
}
