import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRagPromptPreferenceRepository } from './prisma-rag-prompt-preference.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaRagPromptPreferenceRepository', () => {
  let repo: PrismaRagPromptPreferenceRepository;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      ragPromptPreference: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRagPromptPreferenceRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repo = module.get<PrismaRagPromptPreferenceRepository>(PrismaRagPromptPreferenceRepository);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should get context by fileId', async () => {
    prismaMock.ragPromptPreference.findUnique.mockResolvedValue({ customInstructions: 'test' });
    const result = await repo.getByFileId('f1');
    expect(result?.customInstructions).toBe('test');
    expect(prismaMock.ragPromptPreference.findUnique).toHaveBeenCalled();
  });

  it('should upsert preference', async () => {
    await repo.upsert('f1', 'test');
    expect(prismaMock.ragPromptPreference.upsert).toHaveBeenCalledWith({
      where: { fileId: 'f1' },
      create: { fileId: 'f1', customInstructions: 'test' },
      update: { customInstructions: 'test' },
    });
  });
});
