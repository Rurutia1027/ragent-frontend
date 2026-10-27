import * as React from "react";
import { differenceInCalendarDays, isValid } from "date-fns";
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
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    const keyword = query.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((session) => {
      const title = (session.title || "New chat").toLowerCase();
      return title.includes(keyword) || session.id.toLowerCase().includes(keyword);
    });
  }, [query, sessions]);

  const groupedSessions = React.useMemo(() => {
    const now = new Date();
    const groups = new Map<string, typeof filteredSessions>();
    const order: string[] = [];

    const resolveLabel = (value?: string) => {
      const parsed = value ? new Date(value) : now;
      const date = isValid(parsed) ? parsed : now;
      const diff = Math.max(0, differenceInCalendarDays(now, date));
      if (diff === 0) return "Today";
      if (diff <= 7) return "Previous 7 days";
      if (diff <= 30) return "Previous 30 days";
      return "Older";
    };

    filteredSessions.forEach((session) => {
      const label = resolveLabel(session.lastTime);
      if (!groups.has(label)) {
        groups.set(label, []);
        order.push(label);
      }
      groups.get(label)?.push(session);
    });

    return order.map((label) => ({
      label,
      items: groups.get(label) || []
    }));
  }, [filteredSessions]);

  React.useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar, user?.userId]);

  const avatarUrl = user?.avatar?.trim();
  const showAvatar = Boolean(avatarUrl) && !avatarFailed;
  const avatarFallback = (user?.username || user?.userId || "User").slice(0, 1).toUpperCase();
  const sessionTitleFont =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif';

  const startRename = (id: string, title: string) => {
    setRenamingId(id);
    setRenameValue(title || "New chat");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const commitRename = async () => {
    if (!renamingId) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      cancelRename();
      return;
    }
    const currentTitle = sessions.find((session) => session.id === renamingId)?.title || "New chat";
    if (nextTitle === currentTitle) {
      cancelRename();
      return;
    }
    await renameSession(renamingId, nextTitle);
    cancelRename();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-shrink-0 flex-col bg-[#FAFAFA] p-3 transition-transform lg:static lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div style={{ fontFamily: sessionTitleFont }}>
              <p className="text-base font-semibold text-[#1A1A1A]">Ragent AI</p>
              <p className="text-xs text-[#999999]">Powered by AI</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 py-3">
          <div className="relative overflow-hidden rounded-2xl border border-[#E6EEF6] bg-gradient-to-br from-[#F0F9FF] via-white to-[#FEF3C7] p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
            <span
              aria-hidden="true"
              className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#BAE6FD]/70 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-10 -left-12 h-28 w-28 rounded-full bg-[#FDE68A]/70 blur-2xl"
            />
            <div className="relative">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-[#94A3B8]">Quick start</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                  New
                </span>
              </div>
              <button
                type="button"
                className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-left shadow-[0_10px_20px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-[1px] hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)]"
                onClick={() => {
                  createSession().catch(() => null);
                  navigate("/chat");
                  onClose();
                }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white shadow-[0_6px_14px_rgba(37,99,235,0.3)]">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-[#1F2937]">New chat</span>
                  <span className="block text-xs text-[#94A3B8]">Start blank</span>
                </span>
              </button>
              {user?.role === "admin" ? (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-white"
                  onClick={() => {
                    window.open("/admin", "_blank");
                    onClose();
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Admin
                </button>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-[#E6EEF6] bg-white p-3 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Search chats</span>
              <span className="text-[10px] text-[#CBD5F5]">Ctrl / Cmd + K</span>
            </div>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search chats..."
                  className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-colors focus:border-[#93C5FD] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          <div className="sidebar-scroll h-full overflow-y-auto">
            {sessions.length === 0 && (!sessionsLoaded || isLoading) ? (
              <div
                className="flex h-full items-center justify-center text-[#999999]"
                style={{ fontFamily: sessionTitleFont }}
              >
                <Loading label="Loading sessions" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div
                className="flex h-full flex-col items-center justify-center text-[#999999]"
                style={{ fontFamily: sessionTitleFont }}
              >
                <MessageSquare className="h-16 w-16" />
                <p className="mt-2 text-[14px]">No chats yet</p>
              </div>
            ) : (
              <div>
                {groupedSessions.map((group, index) => (
                  <div
                    key={group.label}
                    className={cn("flex flex-col", index === 0 ? "mt-0" : "mt-4")}
                  >
                    <p className="mb-1.5 pl-3 text-[12px] font-normal leading-[18px] text-[#999999]">
                      {group.label}
                    </p>
                    {group.items.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group my-[1px] flex min-h-[40px] cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] leading-[22px] transition-colors duration-200",
                          currentSessionId === session.id
                            ? "bg-[#DBEAFE] text-[#2563EB]"
                            : "text-[#333333] hover:bg-[#F5F5F5]"
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (renamingId === session.id) return;
                          if (renamingId) {
                            cancelRename();
                          }
                          selectSession(session.id).catch(() => null);
                          navigate(`/chat/${session.id}`);
                          onClose();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            selectSession(session.id).catch(() => null);
                            navigate(`/chat/${session.id}`);
                            onClose();
                          }
                        }}
                      >
                        {renamingId === session.id ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                commitRename().catch(() => null);
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                cancelRename();
                              }
                            }}
                            onBlur={() => {
                              commitRename().catch(() => null);
                            }}
                            className="h-6 flex-1 rounded-md border border-[#E5E5E5] bg-white px-2 text-[14px] leading-[22px] text-[#333333] focus:border-[#2563EB] focus:outline-none"
                          />
                        ) : (
                          <span className="min-w-0 flex-1 truncate font-normal">
                            {session.title || "New chat"}
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded text-[#666666] transition-opacity duration-150 hover:bg-[rgba(0,0,0,0.06)]",
                                currentSessionId === session.id
                                  ? "pointer-events-auto text-[#2563EB] opacity-100"
                                  : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                              )}
                              onClick={(event) => event.stopPropagation()}
                              aria-label="Chat actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="min-w-[120px] rounded-lg border-0 bg-white p-0 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                          >
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                startRename(session.id, session.title || "New chat");
                              }}
                              className="px-4 py-2 text-[14px] text-[#333333] focus:bg-[#F5F5F5] focus:text-[#333333] data-[highlighted]:bg-[#F5F5F5] data-[highlighted]:text-[#333333]"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteTarget({
                                  id: session.id,
                                  title: session.title || "New chat"
                                });
                              }}
                              className="px-4 py-2 text-[14px] text-[#FF4D4F] focus:bg-[#F5F5F5] focus:text-[#FF4D4F] data-[highlighted]:bg-[#F5F5F5] data-[highlighted]:text-[#FF4D4F]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-b from-transparent to-[#FAFAFA]"
          />
        </div>
        <div className="mt-auto pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-[#F5F5F5] data-[state=open]:bg-[#EEEEEE]"
                aria-label="User Menu"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#3B82F6] text-white">
                  {showAvatar ? (
                    <img
                      src={avatarUrl}
                      alt={user?.username || user?.userId || "User"}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <span className="text-sm font-medium">{avatarFallback}</span>
                  )}
                </div>
                <span className="flex-1 truncate text-sm font-medium text-[#1A1A1A]">
                  {(() => {
                    const fallback = user?.username || user?.userId || "User";
                    return /^\d+$/.test(fallback) ? "User" : fallback;
                  })()}
                </span>
                <MoreHorizontal className="h-4 w-4 text-[#999999]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-48">
              <DropdownMenuItem asChild>
                <a
                  href="https://nageoffer.com/ragent"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Docs
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://space.bilibili.com/352177376"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Bilibili
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-rose-600 focus:text-rose-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              [{deleteTarget?.title || "This chat"}] will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                const target = deleteTarget;
                const isCurrent = currentSessionId === target.id;
                setDeleteTarget(null);
                deleteSession(target.id)
                  .then(() => {
                    if (isCurrent) {
                      navigate("/chat");
                    }
                  })
                  .catch(() => null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
