import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { IndexRagDocumentUseCase } from '../../application/use-cases/rag/index-rag-document.use-case';
import { ListRagDocumentsUseCase } from '../../application/use-cases/rag/list-rag-documents.use-case';
import { QueryRagDocumentUseCase } from '../../application/use-cases/rag/query-rag-document.use-case';
import { CreateConversationUseCase } from '../../application/use-cases/rag/create-conversation.use-case';
import { GetConversationMessagesUseCase } from '../../application/use-cases/rag/get-conversation-messages.use-case';
import { DeleteConversationUseCase } from '../../application/use-cases/rag/delete-conversation.use-case';
import { GetDocumentChunksUseCase } from '../../application/use-cases/rag/get-document-chunks.use-case';
import { FilterKnowledgeUseCase } from '../../application/use-cases/rag/filter-knowledge.use-case';
import { GetPromptPreferenceUseCase } from '../../application/use-cases/rag/get-prompt-preference.use-case';
import { SavePromptPreferenceUseCase } from '../../application/use-cases/rag/save-prompt-preference.use-case';
import { RagController } from './rag.controller';

@Module({
  imports: [CommonModule, PersistenceModule, StorageModule],
  controllers: [RagController],
  providers: [
    IndexRagDocumentUseCase,
    ListRagDocumentsUseCase,
    QueryRagDocumentUseCase,
    CreateConversationUseCase,
    GetConversationMessagesUseCase,
    DeleteConversationUseCase,
    GetDocumentChunksUseCase,
    FilterKnowledgeUseCase,
    GetPromptPreferenceUseCase,
    SavePromptPreferenceUseCase,
  ],
})
export class RagModule {}
