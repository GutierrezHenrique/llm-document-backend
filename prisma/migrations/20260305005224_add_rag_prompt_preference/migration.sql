-- CreateTable
CREATE TABLE "RagPromptPreference" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "customInstructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RagPromptPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RagPromptPreference_fileId_key" ON "RagPromptPreference"("fileId");
