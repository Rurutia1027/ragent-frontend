import { RouterProvider } from "react-router-dom";

import { Toast } from "@/components/common/Toast";
import { router } from "@/router";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}
