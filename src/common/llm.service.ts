import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PROMPTS } from './prompts/templates';

@Injectable()
export class LlmService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');
    if (!this.client) this.client = new OpenAI({ apiKey: key });
    return this.client;
  }

  async chat(messages: OpenAI.Chat.ChatCompletionMessageParam[], model = 'gpt-4o-mini'): Promise<string> {
    const client = this.getClient();
    const completion = await client.chat.completions.create({ model, messages });
    return completion.choices[0]?.message?.content ?? '';
  }

  async embed(texts: string[], model = 'text-embedding-3-small'): Promise<number[][]> {
    const client = this.getClient();
    const { data } = await client.embeddings.create({ model, input: texts });
    return data
      .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
      .map((d: { embedding: number[] }) => d.embedding);
  }

  /**
   * Parse a natural language filter description into category and keywords for filtering documents.
   */
  async parseFilterDescription(description: string): Promise<{ category?: string; keywords?: string[] }> {
    if (!description?.trim()) return {};
    const content = PROMPTS.PARSE_FILTER(description);
    const raw = await this.chat([{ role: 'user', content }], 'gpt-4o-mini');
    try {
      const jsonStr = raw.replace(/```json?\s*/gi, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(jsonStr) as { category?: string; keywords?: string[] };
      return {
        category: typeof parsed.category === 'string' ? parsed.category.trim() : undefined,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 15).filter((k) => typeof k === 'string') : undefined,
      };
    } catch {
      return {};
    }
  }

  /**
   * One cheap LLM call to classify a document (category + keywords). Use a short sample.
   */
  async classifyDocument(sample: string): Promise<{ category: string; keywords: string[] }> {
    const content = PROMPTS.CLASSIFY_DOCUMENT(sample);
    const raw = await this.chat([{ role: 'user', content }], 'gpt-4o-mini');
    try {
      const jsonStr = raw.replace(/```json?\s*/gi, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(jsonStr) as { category?: string; keywords?: string[] };
      return {
        category: typeof parsed.category === 'string' ? parsed.category : 'document',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
      };
    } catch {
      return { category: 'document', keywords: [] };
    }
  }
}
