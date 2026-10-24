# ragent-frontend

Node.js, TypeScript, and React. The image is built in `ragent-deployment` and deployed on Vercel.

Copy from [nageoffer/ragent `frontend/`](https://github.com/nageoffer/ragent/tree/main/frontend) and keep the same relative paths. Skip `*.tsbuildinfo`, `vite.config.js`, `vite.config.d.ts`, and `frontend/@/`.

Dev server: `http://127.0.0.1:5173`. Vite proxies `/api` to `http://localhost:9090`. Copy `.env` as-is (`VITE_API_BASE_URL=/api/ragent`). Local login is `admin` / `admin` once the backend is up.

Three piles. Run the app at the end of each pile before starting the next one.

## Pile 1 — login page

Copy the tooling and the login screen:

- `package.json`, `package-lock.json`, `index.html`, `public/favicon.svg`
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.cjs`, `postcss.config.cjs`, `components.json`
- `.eslintrc.cjs`, `.prettierrc`, `.prettierignore`, `.env`
- `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/styles/globals.css`
- `src/lib/utils.ts`, `src/types/index.ts`
- `src/utils/storage.ts`, `src/utils/error.ts`
- `src/services/api.ts`, `src/services/authService.ts`
- `src/stores/authStore.ts`, `src/stores/themeStore.ts`
- `src/components/ui/`, `src/components/common/ErrorBoundary.tsx`, `src/components/common/Toast.tsx`
- `src/pages/LoginPage.tsx`, `src/pages/NotFoundPage.tsx`, `src/router.tsx`

`authStore.ts` resets the chat stores on login. Those files are not in this pile. Comment out the `useChatStore` and `useAgentChatStore` imports and the lines that call them. In `router.tsx`, keep `/`, `/login`, and `*` only.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The login form should render. With the backend running, `admin` / `admin` returns a token. `/chat` is not wired yet.

## Pile 2 — chat

Copy the knowledge chat and the agent chat together. `EngineGate` imports both pages, and the login store from pile 1 calls both stores.

- `src/types/agent.ts`
- `src/utils/helpers.ts`, `src/utils/time.ts`
- `src/lib/source.ts`, `src/lib/markdownToText.ts`, `src/lib/csvToMarkdown.ts`, `src/lib/agentTimeline.ts`
- `src/services/chatService.ts`, `sessionService.ts`, `sampleQuestionService.ts`
- `src/services/agentService.ts`, `agentProfileService.ts`, `agentSkillService.ts`, `settingsService.ts`
- `src/stores/chatStore.ts`, `agentChatStore.ts`, `engineStore.ts`
- `src/hooks/useChat.ts`, `useStreamResponse.ts`, `useAgentStream.ts`
- `src/components/layout/`, `src/components/session/`, `src/components/chat/`, `src/components/agent/`
- `src/components/common/EngineGate.tsx`, `Loading.tsx`, `Avatar.tsx`
- `src/pages/ChatPage.tsx`, `src/pages/AgentChatPage.tsx`

Restore the commented lines in `authStore.ts`. Add `/chat` and `/chat/:sessionId` back to `router.tsx`. Both routes render `EngineGate`.

```bash
npm run dev
```

Log in. The app lands on `/chat`. The engine setting chooses the knowledge page or the agent page.

## Pile 3 — admin, one screen at a time

Copy `src/pages/admin/AdminLayout.tsx` and `src/components/admin/` first, then add one row below, uncomment that route, and run again. The route prefix is `/admin`. The logged-in role must be `admin`.

| Stop and run after | Copy | Route |
|---|---|---|
| Shell | `AdminLayout.tsx`, `src/components/admin/` | `/admin` redirects to dashboard once that page exists |
| Dashboard | `pages/admin/dashboard/`, `services/dashboardService.ts` | `/admin/dashboard` |
| Knowledge | `pages/admin/knowledge/`, `components/document/`, `pages/DocPreviewPage.tsx`, `services/knowledgeService.ts` | `/admin/knowledge`, `/preview/doc/:docId` |
| Knowledge graph | `pages/admin/knowledge-graph/`, `services/knowledgeGraphService.ts` | `/admin/knowledge-graph` |
| Intent tree | `pages/admin/intent-tree/`, `services/intentTreeService.ts` | `/admin/intent-tree`, `/admin/intent-list` |
| Ingestion | `pages/admin/ingestion/`, `services/ingestionService.ts` | `/admin/ingestion` |
| Traces | `pages/admin/traces/`, `services/ragTraceService.ts` | `/admin/traces` |
| Change logs | `pages/admin/change-logs/`, `pages/ChangeLogsPage.tsx`, `services/bizChangeLogService.ts` | `/admin/change-logs`, `/change-logs` |
| Settings | `pages/admin/settings/`, `services/settingsService.ts` is already in pile 2 | `/admin/settings` |
| Sample questions | `pages/admin/sample-questions/`, `services/sampleQuestionService.ts` | `/admin/sample-questions` |
| Term mappings | `pages/admin/query-term-mapping/`, `services/queryTermMappingService.ts` | `/admin/mappings` |
| Agents | `pages/admin/agents/`, `pages/admin/agent-skills/` | `/admin/agents`, `/admin/agent-skills` |
| Users | `pages/admin/users/`, `services/userService.ts` | `/admin/users` |

`frontend/tests/`, `frontend/harness/`, and `src/hooks/useGitHubStars.ts` stay out until the screen they cover is already running.
