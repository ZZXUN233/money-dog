# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

小狗钱钱 AI 伴侣 — an AI financial companion app inspired by the book "小狗钱钱" (Money Dog). Features an AI chatbot named "钱钱" (Qian Qian) that helps users build dreams, record success diaries, and develop healthy money habits.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **AI:** Google Gemini (`@google/genai`) + DeepSeek (`openai` SDK, OpenAI-compatible API)
- **Styling:** Tailwind CSS (inline utility classes, no config file)
- **Animation:** framer-motion, canvas-confetti
- **Icons:** lucide-react

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000, host 0.0.0.0)
npm run build        # Production build
npm run preview      # Preview production build
```

No test framework or linter is configured.

## Environment Setup

Requires a `.env.local` file. All keys are exposed to the client via Vite's `define` config.

```env
AI_PROVIDER=gemini        # 或 deepseek，默认 gemini
GEMINI_API_KEY=...        # Gemini 专用
DEEPSEEK_API_KEY=...      # DeepSeek 专用
```

## Architecture

```
App.tsx                    # Root component, view routing, global state (dreams, diary, messages, mood)
├── components/
│   ├── ChatInterface.tsx   # AI chat UI with message bubbles and quick actions
│   ├── DreamSystem.tsx     # Dream creation, savings tracking, deposit with confetti
│   ├── SuccessDiary.tsx    # Daily success diary with AI-generated comments
│   └── MoneyAvatar.tsx     # SVG dog avatar with mood-based expressions (HAPPY/EXCITED/LISTENING/WORRIED/SLEEPING)
└── services/
    ├── aiProvider.ts       # AIProvider interface + shared SYSTEM_INSTRUCTION & buildContext
    ├── aiService.ts        # Facade: dispatches to provider based on AI_PROVIDER env var
    ├── geminiService.ts    # GeminiProvider implementation (Google GenAI SDK)
    └── deepseekService.ts  # DeepSeekProvider implementation (OpenAI-compatible SDK)
```

### Key Patterns

- **View routing:** Manual view switching via `AppView` enum (CHAT/DREAMS/DIARY) and bottom nav bar — no router library.
- **State management:** All state lives in `App.tsx` and is passed down via props. No persistence (data resets on refresh).
- **AI context:** `initializeChat()` creates a chat session with system instructions + current dream/diary context injected into the prompt. All consumers import from `services/aiService.ts` (facade), which dispatches to the configured provider.
- **Mood system:** The avatar mood is determined by simple keyword matching in AI responses (e.g., "棒" → EXCITED, "担心" → WORRIED).

## Path Alias

`@/*` maps to the project root, configured in both `tsconfig.json` and `vite.config.ts`.
