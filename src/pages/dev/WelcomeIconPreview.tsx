import { Bot } from "lucide-react";

export function WelcomeIconPreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#2563EB] shadow-sm">
        <Bot className="h-3.5 w-3.5" />
        RAG assistant
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#2563EB] shadow-sm">
        <Bot className="h-3.5 w-3.5" />
        RAG assistant
      </span>
    </div>
  );
}
