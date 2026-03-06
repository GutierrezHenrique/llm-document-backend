import { LlmService } from './llm.service';
import OpenAI from 'openai';

jest.mock('openai');

describe('LlmService', () => {
  let service: LlmService;
  let mockOpenAI: any;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
      embeddings: {
          create: jest.fn(),
      }
    };
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAI);
    service = new LlmService();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call openai chat and return content', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'hello world' } }],
    };
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const result = await service.chat([{ role: 'user', content: 'hi' }]);
    expect(result).toBe('hello world');
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
  });

  it('should parse filter description correctly', async () => {
      const mockResult = JSON.stringify({ category: 'tech', keywords: ['ai', 'ml'] });
      mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [{ message: { content: `\`\`\`json\n${mockResult}\n\`\`\`` } }],
      });

      const result = await service.parseFilterDescription('filter docs');
      expect(result).toEqual({ category: 'tech', keywords: ['ai', 'ml'] });
  });

  it('should classify document correctly', async () => {
      const mockResult = JSON.stringify({ category: 'legal', keywords: ['law', 'policy'] });
      mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [{ message: { content: mockResult } }],
      });

      const result = await service.classifyDocument('sample content');
      expect(result.category).toBe('legal');
      expect(result.keywords).toContain('law');
  });

  it('should handle JSON parse errors and return defaults', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [{ message: { content: 'invalid json' } }],
      });

      const result = await service.classifyDocument('sample');
      expect(result.category).toBe('document');
      expect(result.keywords).toEqual([]);
  });

  it('should call openai embeddings and return vectors correctly sorted', async () => {
      mockOpenAI.embeddings.create.mockResolvedValue({
          data: [
            { index: 1, embedding: [0.3, 0.4] },
            { index: 0, embedding: [0.1, 0.2] }
          ]
      });

      const result = await service.embed(['t1', 't2']);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual([0.1, 0.2]);
      expect(result[1]).toEqual([0.3, 0.4]);
  });

  it('should throw error if API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(service.chat([])).rejects.toThrow('OPENAI_API_KEY is not set');
  });

  it('should handle parseFilterDescription failures', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'not json' } }],
    });
    const result = await service.parseFilterDescription('test');
    expect(result).toEqual({});
  });
});
