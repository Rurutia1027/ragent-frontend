import { createBrowserRouter } from "react-router-dom";

import { Placeholder } from "@/components/Placeholder";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/ChatPage";
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
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
