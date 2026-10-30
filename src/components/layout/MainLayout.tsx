import * as React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
