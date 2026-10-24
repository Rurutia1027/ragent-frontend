export function Placeholder({ title, path }: { title: string; path: string }) {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>{title}</h1>
      <p>{path}</p>
    </main>
  );
}
