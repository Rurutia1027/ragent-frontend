import { api } from "@/services/api";

export interface ConversationVO {
  conversationId: string;
  title: string;
  lastTime?: string;
}

export interface ConversationMessageVO {
  id: number | string;
  conversationId: string;
  role: string;
  content: string;
  thinkingContent?: string | null;
  thinkingDuration?: number | null;
  vote: number | null;
  createTime?: string;
}

export async function listSessions(): Promise<ConversationVO[]> {
  const data = await api.get("/conversations");
  return data as unknown as ConversationVO[];
}

export async function deleteSession(conversationId: string) {
  return api.delete<void>(`/conversations/${conversationId}`);
}

export async function renameSession(conversationId: string, title: string) {
  return api.put<void>(`/conversations/${conversationId}`, { title });
}

export async function listMessages(conversationId: string): Promise<ConversationMessageVO[]> {
  const data = await api.get(`/conversations/${conversationId}/messages`);
  return data as unknown as ConversationMessageVO[];
}
