# LLM Document Backend

Backend for the LLM Document RAG application. Built with NestJS, Prisma, and LangChain/OpenAI.

## Features
- RAG (Retrieval-Augmented Generation) with PDF and text input.
- Document management and categorization.
- Chat history and context management.
- Vector store integration.

## Installation
```bash
pnpm install
```

## Setup
1. Create a `.env` file based on `.env.example`.
2. Run Prisma migrations:
```bash
npx prisma migrate dev
```

## Running the app
```bash
pnpm start:dev
```
