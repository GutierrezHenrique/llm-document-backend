export const RAG_PROMPT_PREFERENCE_REPOSITORY = Symbol('RAG_PROMPT_PREFERENCE_REPOSITORY');

export interface IRagPromptPreferenceRepository {
  getByFileId(fileId: string): Promise<{ customInstructions: string | null } | null>;
  upsert(fileId: string, customInstructions: string | null): Promise<void>;
}
