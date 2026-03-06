export interface RagChunkRecord {
  id: string;
  text: string;
  keywords: string[];
  embedding?: number[];
  /** When querying entire base (fileId 'all'), source document fileId for building PDF links */
  sourceFileId?: string;
}

export interface RagDocumentListItem {
  fileId: string;
  chunksCount: number;
  createdAt: string;
  category?: string | null;
  keywords?: string[] | null;
}

export const RAG_REPOSITORY = Symbol('RAG_REPOSITORY');

export interface IRagRepository {
  upsertDocument(
    fileId: string,
    meta?: { category?: string; keywords?: string[] },
  ): Promise<{ documentId: string }>;
  deleteChunksByDocumentId(documentId: string): Promise<void>;
  createChunks(
    documentId: string,
    chunks: { text: string; keywords: string[]; embedding?: number[] }[],
  ): Promise<number>;
  findChunksByFileId(fileId: string): Promise<RagChunkRecord[]>;
  /** Retrieve chunks that match any of the given keywords (cheap, no LLM). */
  findChunksByFileIdAndKeywords(
    fileId: string,
    queryKeywords: string[],
    limit: number,
  ): Promise<RagChunkRecord[]>;
  listDocuments(): Promise<RagDocumentListItem[]>;
  deleteDocument(fileId: string): Promise<void>;
}
