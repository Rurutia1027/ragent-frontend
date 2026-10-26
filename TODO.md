# TODO

Copy from tag `1.0.0` of `/Users/emma/LLM/ragent`, under `frontend/`. This version has no Agent.

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

Still wrong or missing:

- [ ] `chatStore` `fetchSessions`: `finally` sets `sessionsLoaded` back to `false`, so an empty sidebar stays on "Loading sessions".
- [ ] `chatStore` `appendStreamContent`: the id check is inverted (`===` skips the streaming message), so deltas land on the other messages.
- [ ] `router.tsx`: `/` is still `Placeholder`. The source sends `/` to `/chat` or `/login`, and `/chat` requires a logged-in user.
- [ ] `ErrorBoundary` around the app, as in the source `App.tsx`.

Skip for now: `session/`, `Avatar.tsx`, `RelativeTime.tsx`, `useChat.ts`. The sidebar "Admin" link waits on stage 3.

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
