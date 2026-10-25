# TODO

Copy from tag `1.0.0` of `/Users/emma/LLM/ragent`, under `frontend/`. This version has no Agent.

## Stage 2 — chat

Already in place: `chatStore`, `sessionService`, `chatService`, `useStreamResponse`, `Loading`, `Header`, plus `textarea`, `alert-dialog`, and `dropdown-menu`. `Sidebar` is only started. `MainLayout` is empty. `/chat` is still a placeholder.

- [ ] Finish `src/components/layout/Sidebar.tsx`
- [ ] `src/components/layout/MainLayout.tsx`
- [ ] `src/services/sampleQuestionService.ts`
- [ ] `src/components/chat/ThinkingIndicator.tsx`
- [ ] `src/components/chat/QuestionRail.tsx`
- [ ] `src/components/chat/MarkdownRenderer.tsx`
- [ ] `src/components/chat/FeedbackButtons.tsx`
- [ ] `src/components/chat/MessageItem.tsx`
- [ ] `src/components/chat/WelcomeScreen.tsx`
- [ ] `src/components/chat/MessageList.tsx`
- [ ] `src/components/chat/ChatInput.tsx`
- [ ] `src/pages/ChatPage.tsx`
- [ ] `src/router.tsx`: render `ChatPage` at `/chat` and `/chat/:sessionId`. Keep login and 404.

Skip for now: `session/`, `Avatar.tsx`, `RelativeTime.tsx`, `useChat.ts`.

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
