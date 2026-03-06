/**
 * Centralized Prompt Templates for the AI Assistant.
 */

export const PROMPTS = {
  /**
   * System message for RAG (Retrieval Augmented Generation).
   */
  RAG_SYSTEM: (customInstructions?: string | null) => {
    let base = `You are an assistant that answers questions based ONLY on the provided excerpts from a document.

Rules:
1. **Language**: Always respond in the SAME language as the user's CURRENT question, regardless of the language of the document or previous messages. If the question is in Portuguese, answer in Portuguese. If in Spanish, answer in Spanish. Use appropriate localized terms.
2. **Content**: Base your answer only on the excerpts. When relevant, cite the source with [1], [2], [3] etc. corresponding to the excerpt numbers.
3. **When excerpts don't fully answer**: Do not just say "the excerpts do not provide an answer." Instead, use what the excerpts DO say to give a helpful reply: infer, connect ideas, or suggest what might apply. If the question is only partially covered, answer that part and note what is not in the document.
4. **Tone**: Be direct and useful. Prefer a clear, actionable answer over meta-commentary about whether the excerpts contain the answer.
5. **Context**: You may see previous messages in this conversation. Keep answers consistent with what you already said and use the document excerpts as the single source of truth.`;
    
    if (customInstructions?.trim()) {
      base += `\n\n**Additional instructions (refine behavior):**\n${customInstructions.trim()}`;
    }
    return base;
  },

  /**
   * User message containing excerpts and the question.
   */
  RAG_USER_CONTENT: (snippets: string[], question: string) => {
    return `Excerpts:\n${snippets.map((s, i) => `[${i + 1}] ${s}`).join('\n\n')}\n\nQuestion: ${question}`;
  },

  /**
   * Simple chat prompt for general questions.
   */
  SIMPLE_CHAT: (question: string) => 
    `You are an AI assistant. Answer the user's question directly and concisely.\n\nUser: ${question}`,

  /**
   * Natural language filter parsing prompt.
   */
  PARSE_FILTER: (description: string) => `The user wants to filter a knowledge base. They said: "${description.trim()}"

Respond with ONLY a JSON object (no markdown, no explanation):
{"category":"optional single category e.g. technical, legal" , "keywords":["optional","array","of","keywords"]}
Use "category" only if the description clearly implies one category. Use "keywords" for specific terms to match. If unclear, return {}.`,

  /**
   * Document classification prompt.
   */
  CLASSIFY_DOCUMENT: (sample: string) => `Based on this document sample, respond with ONLY a JSON object (no markdown):
{"category":"one short category e.g. technical, legal, report","keywords":["keyword1","keyword2","keyword3","keyword4","keyword5"]}
Sample:
${sample.slice(0, 600)}`
};
