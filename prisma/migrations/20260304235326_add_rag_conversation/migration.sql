-- CreateTable
CREATE TABLE "RagConversation" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RagMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "snippets" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RagMessage" ADD CONSTRAINT "RagMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "RagConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
