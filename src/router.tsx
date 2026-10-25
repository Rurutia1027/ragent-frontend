import { createBrowserRouter } from "react-router-dom";

import { Placeholder } from "@/components/Placeholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Placeholder title="Home" path="/" />
  },
  {
    path: "/login",
    element: <Placeholder title="Login" path="/login" />
  },
  {
    path: "*",
    element: <Placeholder title="Not found" path="*" />
  }
]);
