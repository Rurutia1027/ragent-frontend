import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl bg-[#F5F5F5] px-4 py-2 text-[15px] text-[#333333]">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#333333]">
      {message.thinking ? <p className="mb-2 text-sm text-[#2563EB]">{message.thinking}</p> : null}
      <p>{message.content}</p>
    </div>
  );
}
