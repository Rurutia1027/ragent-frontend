import * as React from "react"; 
import { differenceInCalendarDays, isValid} from "date-fns"; 
import {
    BookOpen,
    Bot,
    LogOut,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    PlayCircle,
    Plus,
    Search,
    Settings,
    Trash2
  } from "lucide-react";

import { useNavigate } from "react-router-dom"; 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from "@/components/ui/alert-dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Loading } from "@/components/common/Loading";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";

interface SidebarProps {
    isOpen: boolean; 
    onClose: () => void; 
}

export function Sidebar({isOpen, onClose}: SidebarProps) {
    const {
        sessions, 
        currentSessionId,
        isLoading, 
        sessionsLoaded, 
        createSession, 
        deleteSession, 
        renameSession, 
        selectSession, 
        fetchSessions
    } = useChatStore(); 

    const navigate = useNavigate(); 
    const { user, logout } = useAuthStore(); 
    const [query, setQuery] = React.useState(""); 
    const [renamingId, setRenamingId] = React.useState<string | null>(null); 
    const [renameValue, setRenameValue] = React.useState(""); 
    const [deleteTarget, setDeleteTarget] = React.useState<{
        id: string; 
        title: string; 
    } | null>(null);
    const [avatarFailed, setAvatarFailed] = React.useState(false); 
    const renameInputRef = React.useRef<HTMLInputElement | null>(null); 

    React.useEffect(() => {
        if (sessions.length === 0) {
            fetchSessions().catch(() => null); 
        }
    }, [fetchSessions, sessions.length]);
    
    const filteredSessions = React.useMemo(() => {
        const keyword = query.trim().toLocaleLowerCase(); 
        if (!keyword) return sessions; 
        return sessions.filter((session) => {
            const title = (session.title || "New Chat").toLowerCase(); 
            return title.includes(keyword) || session.id.toLowerCase().includes(keyword); 
        }); 
    }, [query, sessions]); 
// TODO- 
    return (
        <div>

        </div>
    ); 
}
