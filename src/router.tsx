import { createBrowserRouter } from "react-router-dom";

import { Placeholder } from "@/components/Placeholder";
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
    element: <Placeholder title="Chat" path="/chat" />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
