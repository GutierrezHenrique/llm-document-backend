import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRagConversationRepository } from './prisma-rag-conversation.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaRagConversationRepository', () => {
  let repo: PrismaRagConversationRepository;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      ragConversation: {
        create: jest.fn(),
        delete: jest.fn(),
      },
      ragMessage: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRagConversationRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repo = module.get<PrismaRagConversationRepository>(PrismaRagConversationRepository);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should create conversation', async () => {
    prismaMock.ragConversation.create.mockResolvedValue({ id: 'c1' });
    const result = await repo.createConversation('f1');
    expect(result.conversationId).toBe('c1');
    expect(prismaMock.ragConversation.create).toHaveBeenCalledWith({ data: { fileId: 'f1' } });
  });

  it('should get messages and parse snippets', async () => {
    const mockRows = [
      { id: 'm1', role: 'user', content: 'hi', snippets: null, createdAt: new Date() },
      { id: 'm2', role: 'assistant', content: 'hello', snippets: JSON.stringify(['s1']), createdAt: new Date() },
    ];
    prismaMock.ragMessage.findMany.mockResolvedValue(mockRows);

    const msgs = await repo.getMessages('c1');
    expect(msgs).toHaveLength(2);
    expect(msgs[1].snippets).toEqual(['s1']);
  });

  it('should add message with stringified snippets', async () => {
      await repo.addMessage('c1', 'user', 'hi', ['s1']);
      expect(prismaMock.ragMessage.create).toHaveBeenCalledWith({
          data: {
              conversationId: 'c1',
              role: 'user',
              content: 'hi',
              snippets: JSON.stringify(['s1']),
          }
      });
  });

  it('should delete conversation', async () => {
      await repo.deleteConversation('c1');
      expect(prismaMock.ragConversation.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });
});
