# Agent Run Panel - JcurveIQ Take-Home

This is a standalone React component that visualizes a complex, multi-agent AI research pipeline in real-time. It features a mocked event stream that realistically simulates task spawning, parallel processing, tool execution, and partial output streaming.

## 🚀 Quick Start

Ensure you have Node.js installed, then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (No component libraries used)
- **Icons**: Lucide React
- **Language**: TypeScript

## ✨ Features

- **Real-Time Streaming**: Uses a custom `useMockEventStream.ts` hook hooked to `setTimeout` chaining to realistically play back JSON event fixtures over time.
- **Robust State Reducer**: All complex agent events (`task_spawned`, `tool_call`, `run_complete`, etc.) are synthesized into a cohesive `RunState` object via `useRunReducer.ts`.
- **Parallel Clustering**: Tasks with identical `parallel_group` ids are automatically clustered and rendered horizontally with visual indicators.
- **Recoverable States**: Tasks seamlessly transition backward/forward through runtime failures (e.g. Rate Limits) and display retry counts organically.
- **Micro-Animations**: Uses subtle glow animations and Tailwind's `animate-pulse` and `animate-spin` to convey system activity without overwhelming the analyst.

## 🧪 Included Fixtures

- **Run Success**: Simulates a 5-step pipelined research query for Apple R&D. Includes a rate-limit rate-retry success state for Meta filings.
- **Run Error**: Simulates an unrecoverable proxy rotation failure in a parallel node.

---
Built by [Sannu] for JcurveIQ.
