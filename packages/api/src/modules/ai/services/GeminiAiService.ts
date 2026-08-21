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
    // 1. Fetch current available events from database
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
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
      const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];

      for (const modelName of candidateModels) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.2, // Low temperature for high precision and no hallucinated extra categories
              topP: 0.8,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          });

          const eventsCatalogJson = JSON.stringify(
            events.map((e) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              category: e.category, // MOVIE, CONCERT, THEATER
              type: e.type,
              venue: e.venue,
              price: `R$ ${Number(e.price).toFixed(2)}`,
              date: e.date.toISOString(),
            }))
          );

          const prompt = `Você é o "Passfy IA", o assistente de recomendação de ingressos da plataforma Passfy.
Sua missão é selecionar APENAS os eventos do catálogo que atendem com EXATIDÃO e RELEVÂNCIA ao pedido do usuário.

REGRAS OBRIGATÓRIAS DE FILTRAGEM:
1. SE O USUÁRIO PEDIR SHOW, ROCK, MÚSICA, BANDA OU FESTIVAL:
   - Selecione SOMENTE eventos da categoria "CONCERT" do gênero solicitado.
   - NUNCA inclua filmes de cinema (como Duna, Alien) nem peças de teatro.
2. SE O USUÁRIO PEDIR CINEMA OU FILME:
   - Selecione SOMENTE eventos da categoria "MOVIE".
   - NUNCA inclua shows musicais nem teatro.
3. SE O USUÁRIO PEDIR TEATRO OU PEÇA:
   - Selecione SOMENTE eventos da categoria "THEATER".
4. SE O USUÁRIO PEDIR PASSEIO A DOIS, FAMÍLIA OU COM AMIGOS:
   - Selecione apenas eventos que façam sentido temático para essa ocasião.
5. PRECISÃO TOTAL:
   - No array "matchedEventIds", inclua APENAS os IDs dos eventos que são 100% relevantes.
   - NÃO adicione eventos aleatórios para aumentar o tamanho da lista.

Catálogo Oficial de Eventos do Passfy:
${eventsCatalogJson}

Pedido do Usuário: "${userPrompt}"

Retorne OBRIGATORIAMENTE um JSON válido com o seguinte formato:
{
  "recommendation": "Frase curta e direta de no máximo 1 sentença (ex: 'Aqui estão os shows de rock disponíveis no catálogo para você curtir.').",
  "matchedEventIds": ["array com os IDs dos eventos estritamente relevantes"],
  "suggestedVibe": "Tag curta (ex: 'Rock & Shows', 'Cinema Especial', 'Teatro & Cultura', 'Passeio em Família')",
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
          let matchedIds: string[] = Array.isArray(parsed.matchedEventIds)
            ? parsed.matchedEventIds
            : [];

          // Post-processing sanity filter to ensure 100% semantic consistency
          matchedIds = this.enforceStrictRelevance(userPrompt, matchedIds, events);

          if (matchedIds.length > 0) {
            return {
              recommendation:
                parsed.recommendation || 'Aqui estão as melhores opções selecionadas para você.',
              matchedEventIds: matchedIds,
              suggestedVibe: parsed.suggestedVibe || 'Recomendação',
              highlightTip: parsed.highlightTip || '',
              isGeminiActive: true,
              modelUsed: 'Passfy IA',
            };
          }
        } catch (err: any) {
          console.warn(`⚠️ Error trying Gemini model ${modelName}:`, err.message || err);
        }
      }
    }

    // 2. Resilient Local Semantic Engine Fallback
    return this.fallbackLocalSemantic(userPrompt, events);
  }

  /**
   * Deterministic guard to guarantee non-matching categories are stripped out
   */
  private static enforceStrictRelevance(
    prompt: string,
    matchedIds: string[],
    events: any[]
  ): string[] {
    const p = prompt.toLowerCase();
    const isRockOrShow =
      p.includes('rock') ||
      p.includes('metal') ||
      p.includes('guns') ||
      p.includes('metallica') ||
      p.includes('show') ||
      p.includes('festival') ||
      p.includes('banda') ||
      p.includes('música') ||
      p.includes('musica');

    const isCinema =
      p.includes('cinema') ||
      p.includes('filme') ||
      p.includes('imax') ||
      p.includes('pipoca') ||
      p.includes('duna') ||
      p.includes('sessão') ||
      p.includes('sessao');

    const isTheater =
      p.includes('teatro') ||
      p.includes('peça') ||
      p.includes('peca') ||
      p.includes('musical') ||
      p.includes('cultura');

    let filtered = events.filter((e) => matchedIds.includes(e.id));

    // If user explicitly asked for rock/shows, purge MOVIE and THEATER
    if (isRockOrShow && !isCinema && !isTheater) {
      filtered = filtered.filter((e) => e.category === 'CONCERT');
    }
    // If user explicitly asked for cinema/movies, purge CONCERT and THEATER
    else if (isCinema && !isRockOrShow && !isTheater) {
      filtered = filtered.filter((e) => e.category === 'MOVIE');
    }
    // If user explicitly asked for theater, purge CONCERT and MOVIE
    else if (isTheater && !isRockOrShow && !isCinema) {
      filtered = filtered.filter((e) => e.category === 'THEATER');
    }

    return filtered.map((e) => e.id);
  }

  private static fallbackLocalSemantic(
    userPrompt: string,
    events: any[]
  ): AiConciergeResponse {
    const p = userPrompt.toLowerCase().trim();
    let matched: any[] = [];
    let recommendation = '';
    let vibe = 'Recomendação';
    let tip = '';

    // Rock / Metal / Shows / Festivais
    if (
      p.includes('rock') ||
      p.includes('metal') ||
      p.includes('guns') ||
      p.includes('metallica') ||
      p.includes('show') ||
      p.includes('festival') ||
      p.includes('banda') ||
      p.includes('música') ||
      p.includes('musica')
    ) {
      matched = events.filter((e) => {
        const title = e.title.toLowerCase();
        const desc = (e.description || '').toLowerCase();

        if (p.includes('rock') || p.includes('metal') || p.includes('guns') || p.includes('metallica')) {
          return (
            e.category === 'CONCERT' &&
            (title.includes('rock') ||
              title.includes('guns') ||
              title.includes('metallica') ||
              title.includes('metal') ||
              desc.includes('rock') ||
              desc.includes('metal'))
          );
        }

        return e.category === 'CONCERT';
      });

      if (matched.length === 0) {
        matched = events.filter((e) => e.category === 'CONCERT');
      }

      vibe = 'Rock & Shows Ao Vivo';
      recommendation = 'Aqui estão os shows de rock e concertos ao vivo disponíveis no catálogo.';
      tip = 'Dica: Ouça as faixas mais tocadas no player do Spotify integrado antes de ir!';
    }
    // Romantic / Encontro a dois
    else if (
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
        'Para um momento especial e romântico a dois, selecionei experiências com assentos marcados e conforto.';
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
        'Para um passeio agradável em família, selecionei eventos com excelente conforto para todas as idades.';
      tip = 'Dica: Chegue com 20 minutos de antecedência para garantir a melhor acomodação.';
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
        'Para os amantes da sétima arte, aqui estão as melhores sessões de cinema.';
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
        'Aqui estão as melhores apresentações teatrais e culturais em cartaz.';
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
        recommendation = `Aqui estão as melhores opções selecionadas para você.`;
      } else {
        matched = events;
        recommendation = `Aqui estão os principais destaques disponíveis no momento.`;
      }
    }

    return {
      recommendation,
      matchedEventIds: matched.length > 0 ? matched.map((e) => e.id) : events.map((e) => e.id),
      suggestedVibe: vibe,
      highlightTip: tip,
      isGeminiActive: false,
      modelUsed: 'Mecanismo Semântico Inteligente Passfy',
    };
  }
}
