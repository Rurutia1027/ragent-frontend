import * as React from "react"; 
import { ArrowUpRight, BookOpen, Bot, Brain, Check, Lightbulb, Send, Square} from 'lucide-react'; 
import { cn} from "@/lib/utils"; 
import { listSampleQuestions} from "@/services/sampleQuestionService"; 
import { useChatStore } from "@/stores/chatStore";  

type PromptPreset = {
  id?: string; 
  title: string; 
  description: string; 
  prompt: string; 
  icon: React.ComponentType<{className?: string}>; 
}; 

const PRESET_ICONS = [BookOpen, Check, Lightbulb]; 

const DEFAULT_PRESETS: PromptPreset[] = [
  {
    title: "Stuck payment",
    description: "The user was charged, but the order is still waiting for payment",
    prompt: "The user has already been charged, but t_trade_payment_order is still WAITING_PAYMENT. Follow the Payment Core path, say which hop it is stuck on, and whether the next check should be bankOrderNo or the notification record.",
    icon: BookOpen
  },
  {
    title: "Notification failed",
    description: "The order succeeded, but the merchant says they never received it",
    prompt: "The order is already SUCCESS, but the merchant says they did not receive the payment result. How do HTTP_REQUEST_SUCCESS and SUCCESS differ, and if notification fails, should the order be moved back to waiting for payment?",
    icon: Check
  },
  {
    title: "Streaming chat",
    description: "SSE on the React side, from meta to finish",
    prompt: "How does streaming output on the chat page connect? What do the SSE events meta, message, and finish each do, and which endpoint does stop generation call?",
    icon: Lightbulb
  }
]; 


export function WelcomeScreen() {
  const [value, setValue] = React.useState(""); 
  const [isFocused, setIsFocused] = React.useState(false);  
  const [promptPresets, setPromptPresets] = React.useState<PromptPreset[]>(DEFAULT_PRESETS);  
  const isComposingRef = React.useRef(false); 
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null); 
  const { sendMessage, isStreaming, cancelGeneration, deepThinkingEnabled, setDeepThinkingEnabled } =
  useChatStore();

  const focusInput = React.useCallback(() => {
    const el = textareaRef.current; 
    if (!el) return; 
    el.focus({preventScroll: true});     
  }, []); 

  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current; 
    if (!el) return; 
    el.style.height = "auto"; 
    const next = Math.min(el.scrollHeight, 160); 
    el.style.height = `${next}px`; 
  }, []);
  
  React.useEffect(() => {
    adjustHeight(); 
  }, [value, adjustHeight]); 

  React.useEffect(() => {
    let active = true; 

    const loadPresets = async () => {
      const data = await listSampleQuestions().catch(() => null); 
      if (!active || !data || data.length === 0) {
        return;
      }

      const mapped = data
        .filter((item) => item.question && item.question.trim())
        .slice(0, 3)
        .map((item, index) => {
          const question = item.question.trim();
          const title =
            item.title?.trim() ||
            (question.length > 12 ? `${question.slice(0, 12)}...` : question) ||
            `Question ${index + 1}`;
          const description = item.description?.trim() || "Click to start the conversation";
          return {
            id: item.id,
            title,
            description,
            prompt: question,
            icon: PRESET_ICONS[index % PRESET_ICONS.length]
          };
        });
      if (mapped.length > 0) {
        setPromptPresets(mapped);
      }
    };

    loadPresets();
    return () => {
      active = false;
    };
  }, []);
  
  const applyPreset = React.useCallback(
    (prompt: string) => {
      if (isStreaming) {
        return; 
      }
      setValue(prompt); 
      focusInput(); 
    }, 
    [isStreaming, focusInput] 
  ); 

  const handleSubmit = async () => {
    if (isStreaming) {
      cancelGeneration(); 
      focusInput(); 
      return; 
    }

    if (!value.trim()) return; 
    const next = value; 
    setValue(""); 
    focusInput(); 
    await sendMessage(next); 
    focusInput(); 
  }; 

  const hasContent = value.trim().length > 0;  

  return (
    <div className="realtive flex min-h-full items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div>
        
      </div>
    </div>
  ); 
}
