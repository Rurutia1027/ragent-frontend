import { createBrowserRouter } from "react-router-dom";

function Placeholder({ title, path }: { title: string; path: string }) {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>{title}</h1>
      <p>{path}</p>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Placeholder title="Home" path="/" />,
  },
  {
    path: "/login",
    element: <Placeholder title="Login" path="/login" />,
  },
  {
    path: "*",
    element: <Placeholder title="Not found" path="*" />,
  },
]);
