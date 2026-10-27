import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="chat-surface max-w-md rounded-3xl p-8 text-center">
        <p className="font-display text-2xl font-semibold">Page Not Found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link to="/chat">Go to Chat</Link>
        </Button>
      </div>
    </div>
  );
}
