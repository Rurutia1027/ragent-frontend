import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { MainLayout } from "@/components/layout/MainLayout";
import { useChatStore } from "@/stores/chatStore";

export function ChatPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    messages,
    isLoading,
    isStreaming,
    currentSessionId,
    sessions,
    isCreatingNew,
    fetchSessions,
    selectSession,
    createSession
  } = useChatStore();

  const showWelcome = messages.length === 0 && !isLoading;
  const [sessionReady, setSessionReady] = React.useState(false);
  const sessionExists = React.useMemo(() => {
    if (!sessionId) return false;
    return sessions.some((session) => session.id === sessionId);
  }, [sessionId, sessions]);

  React.useEffect(() => {
    let active = true;
    fetchSessions()
      .catch(() => null)
      .finally(() => {
        if (active) {
          setSessionReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [fetchSessions]);

  React.useEffect(() => {
    if (sessionId) {
      if (sessionReady && !sessionExists) {
        createSession().catch(() => null);
        navigate("/chat", { replace: true });
        return;
      }
      selectSession(sessionId).catch(() => null);
      return;
    }

    if (!sessionReady) {
      return;
    }

    if (isCreatingNew) {
      return;
    }

    if (currentSessionId) {
      return;
    }

    createSession().catch(() => null);
  }, [
    sessionId,
    sessionReady,
    sessionExists,
    isCreatingNew,
    currentSessionId,
    selectSession,
    createSession,
    navigate
  ]);

  React.useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      navigate(`/chat/${currentSessionId}`, { replace: true });
    }
  }, [currentSessionId, sessionId, navigate]);

  return (
    <MainLayout>
      <div className="flex h-full flex-col bg-white">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          sessionKey={currentSessionId}
        />
      </div>
      {showWelcome ? null : (
        <div className="relative z-20 bg-white">
          <div className="mx-auto max-w-[840px] px-6 pt-1 pb-4">
            <ChatInput />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
