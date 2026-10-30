import { api } from "@/services/api";

export interface SampleQuestion {
  id: string;
  title?: string | null;
  description?: string | null;
  question: string;
  createTime?: string | null;
  updateTime?: string | null;
}

export async function listSampleQuestions(): Promise<SampleQuestion[]> {
  return api.get<SampleQuestion[], SampleQuestion[]>("/rag/sample-questions");
}
