import { createBrowserRouter } from "react-router-dom";

import { Placeholder } from "@/components/Placeholder";
import { ChatPage } from "@/pages/ChatPage";
import { WelcomeIconPreview } from "@/pages/dev/WelcomeIconPreview";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Placeholder title="Home" path="/" />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/chat",
    element: <ChatPage />
  },
  {
    path: "/chat/:sessionId",
    element: <ChatPage />
  },
  ...(import.meta.env.DEV
    ? [
        {
          path: "/dev/welcome",
          element: <WelcomeIconPreview />
        }
      ]
    : []),
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
