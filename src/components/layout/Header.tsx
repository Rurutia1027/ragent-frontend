import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";
import type { Session } from "@/types";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentSessionId, sessions } = useChatStore();
  const currentSession = sessions.find((session: Session) => session.id === currentSessionId);

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex ietms-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="text-base font-medium text-gray-900">
            {currentSession?.title || "New Chat"}
          </p>
        </div>
      </div>
    </header>
  );
}
