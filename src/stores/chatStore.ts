import { create } from "zustand";  
import { toast } from "sonner";  

import type { CompletionPayload, FeedbackValue, Message, MessageDeltaPayload, Session } from "@/types";
import { buildQuery } from "@/utils/helpers"; 
import { createStreamResponse } from "@/hooks/useStreamResponse";
import {storage} from "@/utils/storage";  

interface ChatState {
    sessions: Session[]; 
    currentSessionId: string | null; 
    messages: Message[]; 
    isLoading: boolean; 
    sessionsLoaded: boolean; 
    inputFocusKey: number; 
    isStreaming: boolean; 
    isCreatingNew: boolean; 
    deepThinkingEnabled: boolean;  
    thinkingStartAt: number | null; 
    streamTaskId: string | null; 
    streamAbort: (() => void) | null; 
    streamingMessageId: string | null; 
    cancelRequested: boolean; 
    fetchSessions: () => Promise<void>; 
    createSession: () => Promise<string>; 
    deleteSession: (sessionId: string) => Promise<void>; 
    renameSession: (sessionId: string, title: string) => Promise<void>; 
    selectSession: (sessionId: string) => void; 
    updateSessionTitle: (sessionId: string, title: string) => void; 
    setDeepThinkingEnabled: (enabled: boolean) => void; 
    sendMessage: (content: string) => Promise<void>; 
    cancelGeneration:() => void; 
    appendStreamContent: (delta: string) => void; 
    appendThinkingContent: (delta: string) => void; 
    submitFeedback: (messageId: string, feedback: FeedbackValue) => Promise<void>; 
}

function mapVoteToFeedback(vote?: number | null): FeedbackValue {
    if (vote === 1) return "like"; 
    if (vote === -1) return "dislike"; 
    return null; 
}

function upsertSession(sessions: Session[], next: Session) {
    const index = sessions.findIndex((session) => session.id === next.id); 
    const updated = [...sessions]; 
    if (index >= 0) {
        updated[index] = { ...sessions[index], ...next}; 
    } else {
        updated.unshift(next); 
    }

    return updated.sort((a, b) => {
        const timeA = a.lastTime ? new Date(a.lastTime).getTime() : 0; 
        const timeB = b.lastTime ? new Date(b.lastTime).getTime() : 0;
        return timeB - timeA; 
    }); 
}

function computeThinkingDuration(startAt?: number | null) {
    if (!startAt) return undefined; 
    const seconds = Math.round((Date.now() - startAt) / 1000); 
    return Math.max(1, seconds)
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const useChatStore = create<ChatState>((set, get) => ({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false,
    sessionsLoaded: false,
    inputFocusKey: 0,
    isStreaming: false,
    isCreatingNew: false,
    deepThinkingEnabled: false,
    thinkingStartAt: null,
    streamTaskId: null,
    streamAbort: null,
    streamingMessageId: null,
    cancelRequested: false,

    fetchSessions: async () => {},
    createSession: async () => "",
    deleteSession: async () => {},
    renameSession: async () => {},
    selectSession: () => {},
    updateSessionTitle: () => {},
    setDeepThinkingEnabled: () => {},
    sendMessage: async () => {},
    cancelGeneration: () => {},
    appendStreamContent: () => {},
    appendThinkingContent: () => {},
    submitFeedback: async () => {},
}));