import { Test, TestingModule } from '@nestjs/testing';
import { PersistenceModule } from './persistence.module';
import { RAG_REPOSITORY } from '../../application/ports/rag.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../application/ports/rag-conversation.repository';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../application/ports/rag-prompt-preference.repository';

describe('PersistenceModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [PersistenceModule],
        }).compile();
    });

    it('should provide repositories', () => {
        expect(module.get(RAG_REPOSITORY)).toBeDefined();
        expect(module.get(RAG_CONVERSATION_REPOSITORY)).toBeDefined();
        expect(module.get(RAG_PROMPT_PREFERENCE_REPOSITORY)).toBeDefined();
    });
});
