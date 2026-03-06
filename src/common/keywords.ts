/**
 * Keyword extraction without LLM - reduces cost.
 * Tokenize, remove stopwords (en + pt), return top N by frequency.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na',
  'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'entre', 'até', 'após', 'desde', 'que',
  'e', 'mas', 'ou', 'nem', 'quando', 'onde', 'como', 'porque', 'que', 'se', 'nao', 'sim', 'ja', 'mais',
  'menos', 'muito', 'pouco', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'mesmo', 'mesma',
  'ser', 'estar', 'ter', 'haver', 'fazer', 'ir', 'vir', 'sao', 'foi', 'era', 'sido', 'sendo',
]);

const MAX_KEYWORDS_PER_CHUNK = 12;
const MIN_WORD_LENGTH = 2;
const MAX_WORD_LENGTH = 40;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(/[\s\p{P}]/u)
    .map((w) => w.replace(/^\d+$/, '').trim())
    .filter(
      (w) =>
        w.length >= MIN_WORD_LENGTH &&
        w.length <= MAX_WORD_LENGTH &&
        !STOPWORDS.has(w) &&
        /[\p{L}\p{N}]/u.test(w),
    );
}

/**
 * Extract top keywords by frequency from text (no LLM).
 */
export function extractKeywords(text: string, topN = MAX_KEYWORDS_PER_CHUNK): string[] {
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  for (const t of tokens) {
    freq[t] = (freq[t] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([k]) => k);
}

/**
 * Extract keywords from a question for matching (same algo, fewer words).
 */
export function extractKeywordsFromQuestion(question: string, topN = 8): string[] {
  return extractKeywords(question, topN);
}
