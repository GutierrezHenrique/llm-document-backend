import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRagRepository } from './prisma-rag.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaRagRepository', () => {
  let repo: PrismaRagRepository;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      ragDocument: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      ragChunk: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRagRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repo = module.get<PrismaRagRepository>(PrismaRagRepository);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should upsert document', async () => {
    prismaMock.ragDocument.upsert.mockResolvedValue({ id: 'd1' });
    const result = await repo.upsertDocument('f1', { category: 'cat', keywords: ['k'] });
    expect(result.documentId).toBe('d1');
  });

  it('should find chunks by fileId', async () => {
    prismaMock.ragDocument.findUnique.mockResolvedValue({
      chunks: [{ id: 'c1', text: 'txt', keywords: JSON.stringify(['k']), embedding: null }]
    });
    const result = await repo.findChunksByFileId('f1');
    expect(result).toHaveLength(1);
    expect(result[0].keywords).toEqual(['k']);
  });

  it('should handle all knowledge base chunks', async () => {
      prismaMock.ragChunk.findMany.mockResolvedValue([{ id: 'c1', text: 'txt', keywords: null, embedding: null }]);
      const result = await repo.findChunksByFileId('all');
      expect(result).toHaveLength(1);
  });

  it('should list documents correctly', async () => {
      prismaMock.ragDocument.findMany.mockResolvedValue([
          { fileId: 'f1', createdAt: new Date(), category: 'cat', keywords: JSON.stringify(['k']), _count: { chunks: 5 } }
      ]);
      const result = await repo.listDocuments();
      expect(result).toHaveLength(1);
      expect(result[0].chunksCount).toBe(5);
  });

  it('should delete document', async () => {
      await repo.deleteDocument('f1');
      expect(prismaMock.ragDocument.delete).toHaveBeenCalledWith({ where: { fileId: 'f1' } });
  });

  it('should create chunks', async () => {
      prismaMock.ragChunk.createMany.mockResolvedValue({ count: 2 });
      const count = await repo.createChunks('d1', [{ text: 't1', keywords: ['k1'] }, { text: 't2', keywords: ['k2'] }]);
      expect(count).toBe(2);
      expect(prismaMock.ragChunk.createMany).toHaveBeenCalled();
  });

  it('should delete chunks by document id', async () => {
      await repo.deleteChunksByDocumentId('d1');
      expect(prismaMock.ragChunk.deleteMany).toHaveBeenCalledWith({ where: { documentId: 'd1' } });
  });

  it('should find chunks by fileId and keywords', async () => {
      prismaMock.ragDocument.findUnique.mockResolvedValue({ id: 'd1' });
      prismaMock.$queryRaw.mockResolvedValue([{ id: 'c1', text: 'match', keywords: JSON.stringify(['ai']), embedding: null }]);
      
      const result = await repo.findChunksByFileIdAndKeywords('f1', ['ai'], 5);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('match');
  });

  it('should find chunks by keywords in "all" documents', async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ id: 'c1', text: 'global match', keywords: JSON.stringify(['ai']), embedding: null }]);
      
      const result = await repo.findChunksByFileIdAndKeywords('all', ['ai'], 5);
      expect(result).toHaveLength(1);
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
  });
});
