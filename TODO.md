# TODO

Copy from tag `1.0.0` of `/Users/emma/LLM/ragent`, under `frontend/`. This version has no Agent.

## This weekend — get the chat app running

Goal: log in, send a message, see the stream land on that reply, and open the session again from the sidebar. Admin does not block this.

### Saturday

- [ ] Make `npm run dev` compile. `src/router.tsx` imports `ChatPage` twice and registers `/chat/:sessionId` twice.
- [ ] Fix `chatStore` `fetchSessions`: `finally` sets `sessionsLoaded` back to `false`, so an empty sidebar stays on "Loading sessions".
- [ ] Fix `chatStore` `appendStreamContent`: the id check is inverted (`===` skips the streaming message), so deltas land on the other messages.
- [ ] Replace the `/` placeholder. Logged out goes to `/login`. Logged in goes to `/chat`.
- [ ] Guard `/chat` and `/chat/:sessionId`. No token redirects to `/login`.
- [ ] Walk one path against the backend (`VITE_API_BASE_URL=/api/ragent`): login, new chat, send, stream on the current reply, refresh, click the session in the sidebar.
- [ ] Leave the sidebar's own session list in place. `SessionList` and `SessionItem` are not mounted yet. Do not swap them in until the path above works.

### Sunday

- [ ] Add the `ErrorBoundary` from the source `App.tsx`.
- [ ] Open `/admin` without a blank tab. `AdminLayout` is an empty file and there is no `/admin` route. The sidebar Admin button already does `window.open("/admin")`.
- [ ] One admin screen only: Dashboard. `SimpleLineChart.tsx` is empty. Knowledge, intent tree, ingestion, traces, settings, sample questions, term mappings, and users wait until next week. `CreateKnowledgeBaseDialog.tsx` can stay unused until then.

## Stage 2 — chat

## Stage 2 — chat

In place: `chatStore`, `sessionService`, `chatService`, `sampleQuestionService`, `useStreamResponse`, `Loading`, `Toast`, `Header`, `Sidebar`, `MainLayout`, the chat components, `ChatPage`, and `/chat` plus `/chat/:sessionId`. Login and 404 stay. The GitHub star count in `Header` is removed on purpose.

- [x] `src/components/layout/Sidebar.tsx`
- [x] `src/components/layout/MainLayout.tsx`
- [x] `src/services/sampleQuestionService.ts`
- [x] `src/components/chat/ThinkingIndicator.tsx`
- [x] `src/components/chat/QuestionRail.tsx`
- [x] `src/components/chat/MarkdownRenderer.tsx`
- [x] `src/components/chat/FeedbackButtons.tsx`
- [x] `src/components/chat/MessageItem.tsx`
- [x] `src/components/chat/WelcomeScreen.tsx`
- [x] `src/components/chat/MessageList.tsx`
- [x] `src/components/chat/ChatInput.tsx`
- [x] `src/pages/ChatPage.tsx`
- [x] `src/router.tsx`: `ChatPage` at `/chat` and `/chat/:sessionId`
- [x] `src/components/common/Toast.tsx`, mounted in `App`

Still wrong or missing (order is in "This weekend" above):

- [ ] `chatStore` `fetchSessions`: `finally` sets `sessionsLoaded` back to `false`, so an empty sidebar stays on "Loading sessions".
- [ ] `chatStore` `appendStreamContent`: the id check is inverted (`===` skips the streaming message), so deltas land on the other messages.
- [ ] `router.tsx`: duplicate `ChatPage` import and duplicate `/chat/:sessionId`. `/` is still `Placeholder`. The source sends `/` to `/chat` or `/login`, and `/chat` requires a logged-in user.
- [ ] `ErrorBoundary` around the app, as in the source `App.tsx`.

`SessionList` / `SessionItem` exist and are not used. The sidebar still renders sessions itself. Skip swapping them in until the chat path works. Also skip `Avatar.tsx` and `useChat.ts`. The sidebar "Admin" link waits on stage 3.

## Stage 3 — admin

One screen at a time. Routes sit under `/admin`, and the role must be `admin`.

- [ ] `AdminLayout` and `src/components/admin/`
- [ ] Dashboard
- [ ] Knowledge, including document preview
- [ ] Intent tree
- [ ] Ingestion
- [ ] Traces
- [ ] Settings
- [ ] Sample questions
- [ ] Term mappings
- [ ] Users

## Deploy

The plan is in the Frontend section of `ragent-deployment/README.md`.

- [ ] Frontend Dockerfile: produce `dist/` during the image build and copy it into nginx
- [ ] A separate CodePipeline for `ragent-frontend`, pushing the image to ECR `ragent-frontend`
- [ ] ECS pulls that image

## Outside this repo

Finishing the lists above does not cover these. A fullstack interview still asks about them.

- [ ] Testing: component tests, API tests, and one end-to-end path from login through sending a message. This repo has almost none.
- [ ] Release: rollback, separate config and secrets per environment, and how a database migration ships with a release. The current pipeline only builds images.
- [ ] Security: XSS, CSRF, the choice between cookies and bearer tokens, and dependency vulnerabilities. This app only sends a bearer token on requests.
- [ ] Data: indexes, transactions, and slow queries. Postgres is in the deployment stack and is invisible from the frontend.
- [ ] Production debugging: logs, metrics, and alerts. The admin RAG trace covers retrieval only.
- [ ] System behavior beyond the browser: cache, rate limits, and what to do when a queue backs up. Redis and RocketMQ are in the backend deployment, with no exercise of their own.
- [ ] Collaboration: branches, code review, and how frontend and backend stay aligned when an API changes.
