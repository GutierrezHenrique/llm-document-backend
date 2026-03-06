import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { IRagPromptPreferenceRepository } from '../../application/ports/rag-prompt-preference.repository';

@Injectable()
export class PrismaRagPromptPreferenceRepository implements IRagPromptPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByFileId(fileId: string): Promise<{ customInstructions: string | null } | null> {
    const row = await this.prisma.ragPromptPreference.findUnique({
      where: { fileId },
      select: { customInstructions: true },
    });
    return row ?? null;
  }

  async upsert(fileId: string, customInstructions: string | null): Promise<void> {
    await this.prisma.ragPromptPreference.upsert({
      where: { fileId },
      create: { fileId, customInstructions },
      update: { customInstructions },
    });
  }
}
