import { extractKeywords, extractKeywordsFromQuestion } from './keywords';

describe('Keyword Utils', () => {
    it('should extract top keywords and remove stopwords', () => {
        const text = 'The artificial intelligence is a part of the computer science. AI is good. AI is the future.';
        const keywords = extractKeywords(text, 5);
        
        expect(keywords).toContain('ai');
        expect(keywords).toContain('artificial');
        expect(keywords).toContain('intelligence');
        expect(keywords).not.toContain('the');
        expect(keywords).not.toContain('is');
    });

    it('should respect topN limit', () => {
        const text = 'one two three four five six seven eight nine ten';
        const keywords = extractKeywords(text, 3);
        expect(keywords).toHaveLength(3);
    });

    it('should filter short words', () => {
        const text = 'a bb c ddd';
        const keywords = extractKeywords(text, 10);
        expect(keywords).toContain('bb');
        expect(keywords).toContain('ddd');
        expect(keywords).not.toContain('a');
        expect(keywords).not.toContain('c');
    });

    it('should extract from question', () => {
        const question = 'What are the main concepts of artificial intelligence?';
        const keywords = extractKeywordsFromQuestion(question, 3);
        expect(keywords).toContain('main');
        expect(keywords).toContain('concepts');
        expect(keywords).toContain('artificial');
    });

    it('should handle special characters', () => {
        const text = 'ML/AI & Data-Science are great!!!';
        const keywords = extractKeywords(text);
        expect(keywords).toContain('ml');
        expect(keywords).toContain('ai');
        expect(keywords).toContain('science');
    });
});
