import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaRagRepository } from './prisma-rag.repository';
import { PrismaRagConversationRepository } from './prisma-rag-conversation.repository';
import { PrismaRagPromptPreferenceRepository } from './prisma-rag-prompt-preference.repository';
import { RAG_REPOSITORY } from '../../application/ports/rag.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../application/ports/rag-conversation.repository';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../application/ports/rag-prompt-preference.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaRagRepository,
    { provide: RAG_REPOSITORY, useClass: PrismaRagRepository },
    PrismaRagConversationRepository,
    { provide: RAG_CONVERSATION_REPOSITORY, useClass: PrismaRagConversationRepository },
    PrismaRagPromptPreferenceRepository,
    { provide: RAG_PROMPT_PREFERENCE_REPOSITORY, useClass: PrismaRagPromptPreferenceRepository },
  ],
  exports: [RAG_REPOSITORY, RAG_CONVERSATION_REPOSITORY, RAG_PROMPT_PREFERENCE_REPOSITORY],
})
export class PersistenceModule {}
