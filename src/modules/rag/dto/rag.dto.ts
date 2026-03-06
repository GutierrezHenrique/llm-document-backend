export class IndexPdfResponseDto {
  chunks!: number;
}

export class IndexTextBodyDto {
  fileId!: string;
  text!: string;
}

export class QueryBodyDto {
  fileId!: string;
  question!: string;
  topK?: number;
  conversationId?: string;
  /** Optional custom instructions to refine the assistant (appended to system prompt). */
  customInstructions?: string;
}

export class QueryResponseDto {
  answer!: string;
  snippets!: string[];
  conversationId!: string;
  /** When querying entire base (fileId 'all'), fileId per snippet for PDF links */
  snippetSourceFileIds?: string[];
}

export class FilterBodyDto {
  filterDescription!: string;
}

export class FilteredChunkDto {
  id!: string;
  text!: string;
  keywords!: string[];
}

export class FilteredDocumentDto {
  fileId!: string;
  chunksCount!: number;
  category?: string | null;
  keywords?: string[] | null;
  createdAt!: string;
  chunks!: FilteredChunkDto[];
}

export class FilteredKnowledgeResponseDto {
  documents!: FilteredDocumentDto[];
}
