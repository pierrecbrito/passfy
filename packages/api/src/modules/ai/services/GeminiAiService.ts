import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../../core/database/prisma';
import { env } from '../../../core/config/env';

export interface AiConciergeResponse {
  recommendation: string;
  matchedEventIds: string[];
  suggestedVibe: string;
  highlightTip?: string;
  isGeminiActive: boolean;
  modelUsed: string;
}

export class GeminiAiService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getGeminiClient(): GoogleGenerativeAI | null {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini')) {
      return null;
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
    }
    return this.genAI;
  }

  static async recommendEvents(userPrompt: string): Promise<AiConciergeResponse> {
    // 1. Fetch current available events from database to provide as ground truth
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // current and future events
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        type: true,
        venue: true,
        date: true,
        price: true,
        capacity: true,
      },
      orderBy: { date: 'asc' },
    });

    const client = this.getGeminiClient();

    // If Gemini API key is configured, call Google Gemini
    if (client) {
      const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      
      for (const modelName of candidateModels) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          });

          const eventsCatalogJson = JSON.stringify(
            events.map((e) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              category: e.category,
              type: e.type,
              venue: e.venue,
              price: `R$ ${Number(e.price).toFixed(2)}`,
              date: e.date.toISOString(),
            }))
          );

          const prompt = `Você é o "Passfy IA", o assistente de ingressos da plataforma Passfy.
Sua missão é entender a intenção do usuário e selecionar os melhores eventos do catálogo abaixo de forma direta, sem se explicar demais.

Catálogo Oficial de Eventos do Passfy:
${eventsCatalogJson}

Pedido do Usuário: "${userPrompt}"

Retorne OBRIGATORIAMENTE um JSON válido com o seguinte formato:
{
  "recommendation": "Frase curta, direta e objetiva (máximo 1 frase, sem enrolação ou explicações longas).",
  "matchedEventIds": ["array com os IDs dos eventos correspondentes"],
  "suggestedVibe": "Tag curta (ex: 'Romântico & VIP', 'Passeio em Família', 'Rock com Amigos', 'Cinema Especial')",
  "highlightTip": "Dica curta opcional"
}`;

          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          let cleaned = rawText.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
          }
          if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
          }
          cleaned = cleaned.trim();

          const parsed = JSON.parse(cleaned);

          return {
            recommendation: parsed.recommendation || 'Aqui estão as melhores opções selecionadas para você.',
            matchedEventIds: Array.isArray(parsed.matchedEventIds) && parsed.matchedEventIds.length > 0
              ? parsed.matchedEventIds
              : events.map((e) => e.id),
            suggestedVibe: parsed.suggestedVibe || 'Recomendação',
            highlightTip: parsed.highlightTip || '',
            isGeminiActive: true,
            modelUsed: 'Passfy IA',
          };
        } catch (err: any) {
          console.warn(`⚠️ Error trying Gemini model ${modelName}:`, err.message || err);
          // try next model
        }
      }
    }

    // 2. Resilient Local Semantic Engine Fallback
    return this.fallbackLocalSemantic(userPrompt, events);
  }

  private static fallbackLocalSemantic(
    userPrompt: string,
    events: any[]
  ): AiConciergeResponse {
    const p = userPrompt.toLowerCase().trim();
    let matched = events;
    let recommendation = '';
    let vibe = 'Recomendação Personalizada';
    let tip = 'Dica: Conecte-se com sua conta para salvar seus ingressos na carteira digital.';

    // Romantic / Encontro a dois
    if (
      p.includes('românt') ||
      p.includes('romant') ||
      p.includes('dois') ||
      p.includes('casal') ||
      p.includes('namorad') ||
      p.includes('encontro') ||
      p.includes('date') ||
      p.includes('sair com alguém') ||
      p.includes('sair com alguem')
    ) {
      matched = events.filter(
        (e) =>
          e.category === 'MOVIE' ||
          e.category === 'THEATER' ||
          e.type === 'SEATED' ||
          e.title.toLowerCase().includes('duna') ||
          e.title.toLowerCase().includes('coldplay')
      );
      vibe = 'Romântico & VIP';
      recommendation =
        'Para um momento especial e romântico a dois, selecionei experiências aconchegantes com assentos marcados VIP, som imersivo e espetáculos envolventes.';
      tip = 'Dica: Escolha assentos centrais nas fileiras C ou D para o melhor campo de visão!';
    }
    // Family / Crianças / Família
    else if (
      p.includes('famíl') ||
      p.includes('famil') ||
      p.includes('criança') ||
      p.includes('crianca') ||
      p.includes('filho') ||
      p.includes('pais') ||
      p.includes('domingo')
    ) {
      matched = events.filter(
        (e) =>
          e.category === 'MOVIE' ||
          e.category === 'THEATER' ||
          e.title.toLowerCase().includes('duna') ||
          e.title.toLowerCase().includes('alien')
      );
      vibe = 'Passeio em Família';
      recommendation =
        'Para um passeio agradável em família, selecionei eventos com excelente infraestrutura, conforto e salas de exibição premium para todas as idades.';
      tip = 'Dica: Chegue com 20 minutos de antecedência para garantir a melhor pipoca e acomodação.';
    }
    // Rock / Show / Amigos / Festivais
    else if (
      p.includes('amigo') ||
      p.includes('rock') ||
      p.includes('festival') ||
      p.includes('galera') ||
      p.includes('show') ||
      p.includes('balada') ||
      p.includes('animad') ||
      p.includes('música') ||
      p.includes('musica')
    ) {
      matched = events.filter(
        (e) =>
          e.category === 'CONCERT' ||
          e.type === 'GENERAL_ADMISSION' ||
          e.title.toLowerCase().includes('rock') ||
          e.title.toLowerCase().includes('festival') ||
          e.title.toLowerCase().includes('coldplay')
      );
      vibe = 'Rock & Festival com Amigos';
      recommendation =
        'Para curtir e vibrar com os amigos, separei os shows e festivais mais eletrizantes com área de pista e integração com setlist oficial no Spotify!';
      tip = 'Dica: Ouça as faixas mais tocadas no player do Spotify integrado na página do evento antes de ir!';
    }
    // Cinema
    else if (
      p.includes('cinema') ||
      p.includes('filme') ||
      p.includes('pipoca') ||
      p.includes('imax') ||
      p.includes('3d')
    ) {
      matched = events.filter((e) => e.category === 'MOVIE');
      vibe = 'Cinema IMAX & Dolby Atmos';
      recommendation =
        'Para os amantes da sétima arte, aqui estão as melhores sessões com salas IMAX, som Dolby Atmos e poltronas reclináveis.';
      tip = 'Dica: Sessões IMAX proporcionam até 40% a mais de imagem útil na tela.';
    }
    // Teatro & Cultura
    else if (
      p.includes('teatro') ||
      p.includes('cultura') ||
      p.includes('peça') ||
      p.includes('musical')
    ) {
      matched = events.filter((e) => e.category === 'THEATER');
      vibe = 'Cultura & Teatro';
      recommendation =
        'Aqui estão as melhores apresentações teatrais e culturais em cartaz com grandes atuações e narrativas marcantes.';
    }
    // Semantic keywords fallback
    else {
      const keywords = p.split(/\s+/).filter((w) => w.length > 2);
      const candidates = events.filter((e) => {
        const content = `${e.title} ${e.description} ${e.venue} ${e.category}`.toLowerCase();
        return keywords.some((k) => content.includes(k));
      });

      if (candidates.length > 0) {
        matched = candidates;
        recommendation = `Com base no que você descreveu ("${userPrompt}"), selecionei ${candidates.length} experiência(s) com alta afinidade ao seu estilo.`;
      } else {
        matched = events;
        recommendation = `Entendi sua preferência por "${userPrompt}". Apresento os principais destaques disponíveis no momento!`;
      }
    }

    return {
      recommendation,
      matchedEventIds: matched.length > 0 ? matched.map((e) => e.id) : events.map((e) => e.id),
      suggestedVibe: vibe,
      highlightTip: tip,
      isGeminiActive: false,
      modelUsed: 'Mecanismo Semântico Inteligente Local (Adicione GEMINI_API_KEY no .env para ativar a IA em nuvem)',
    };
  }
}
