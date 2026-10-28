import { useCallback, useEffect, useRef, useState } from "react";
import {
  Database,
  FileBarChart,
  FolderOpen,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/RelativeTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { KnowledgeBase, PageResult } from "@/services/knowledgeService";
import {
  deleteKnowledgeBase,
  getKnowledgeBasesPage,
  renameKnowledgeBase
} from "@/services/knowledgeService";
import { CreateKnowledgeBaseDialog } from "@/components/admin/CreateKnowledgeBaseDialog";
import { getErrorMessage } from "@/utils/error";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATS_PAGE_SIZE = 200;

export function KnowledgeListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nameFromQuery = searchParams.get("name") || "";
  const [pageData, setPageData] = useState<PageResult<KnowledgeBase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBase | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState(nameFromQuery);
  const [keyword, setKeyword] = useState(nameFromQuery);
  const [pageNo, setPageNo] = useState(1);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; kb: KnowledgeBase | null }>({
    open: false,
    kb: null
  });
  const [renameValue, setRenameValue] = useState("");
  const [stats, setStats] = useState({
    totalCount: 0,
    documentCount: 0,
    activeCount: 0,
    creatorCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const statsRequestId = useRef(0);

  const knowledgeBases = pageData?.records || [];

  const loadKnowledgeBases = useCallback(
    async (current = pageNo, name = keyword) => {
      try {
        setLoading(true);
        const data = await getKnowledgeBasesPage(current, PAGE_SIZE, name || undefined);
        setPageData(data);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load the knowledge base list"));
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [pageNo, keyword]
  );

  const loadStats = useCallback(
    async (name = keyword) => {
      const requestId = ++statsRequestId.current;
      const normalized = name.trim();
      setStatsLoading(true);
      try {
        const firstPage = await getKnowledgeBasesPage(1, STATS_PAGE_SIZE, normalized || undefined);
        if (statsRequestId.current !== requestId) return;

        let documentTotal = 0;
        let activeTotal = 0;
        const creatorNames = new Set<string>();
        const addRecords = (records: KnowledgeBase[] = []) => {
          records.forEach((kb) => {
            const docCount = kb.documentCount ?? 0;
            documentTotal += docCount;
            if (docCount > 0) {
              activeTotal += 1;
            }
            if (kb.createdBy) {
              creatorNames.add(kb.createdBy);
            }
          });
        };

        addRecords(firstPage.records || []);

        const totalCount = firstPage.total ?? (firstPage.records?.length || 0);
        const totalPages = firstPage.pages || Math.max(1, Math.ceil(totalCount / STATS_PAGE_SIZE));

        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage = await getKnowledgeBasesPage(
            page,
            STATS_PAGE_SIZE,
            normalized || undefined
          );
          if (statsRequestId.current !== requestId) return;
          addRecords(nextPage.records || []);
        }

        if (statsRequestId.current !== requestId) return;
        setStats({
          totalCount,
          documentCount: documentTotal,
          activeCount: activeTotal,
          creatorCount: creatorNames.size
        });
      } catch (error) {
        if (statsRequestId.current !== requestId) return;
        console.error(error);
        setStats({
          totalCount: 0,
          documentCount: 0,
          activeCount: 0,
          creatorCount: 0
        });
      } finally {
        if (statsRequestId.current === requestId) {
          setStatsLoading(false);
        }
      }
    },
    [keyword]
  );

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  useEffect(() => {
    loadStats(keyword);
  }, [keyword, loadStats]);

  useEffect(() => {
    const trimmed = nameFromQuery.trim();
    if (trimmed !== keyword) {
      setSearchName(trimmed);
      setKeyword(trimmed);
      setPageNo(1);
    }
  }, [nameFromQuery, keyword]);

  useEffect(() => {
    if (renameDialog.open) {
      setRenameValue(renameDialog.kb?.name || "");
    }
  }, [renameDialog]);

  const handleSearch = () => {
    setPageNo(1);
    setKeyword(searchName.trim());
  };

  const handleRefresh = () => {
    setPageNo(1);
    loadKnowledgeBases(1, keyword);
    loadStats(keyword);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteKnowledgeBase(deleteTarget.id);
      toast.success("Deleted");
      setDeleteTarget(null);
      setPageNo(1);
      await loadKnowledgeBases(1, keyword);
      await loadStats(keyword);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete"));
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatStatValue = (value: number) => {
    if (statsLoading) return "--";
    return value.toLocaleString("en-US");
  };

  const renderEmbeddingModel = (model?: string) => {
    if (!model) return "-";
    const parts = model.split("-");
    if (parts.length < 2) {
      return <span className="text-sm text-slate-700">{model}</span>;
    }
    const head = parts.slice(0, -1).join("-");
    const tail = parts[parts.length - 1];
    return (
      <div className="flex flex-col text-xs text-slate-500">
        <span className="font-medium text-slate-700">{head}</span>
        <span>{tail}</span>
      </div>
    );
  };

  const getCollectionBadgeClass = (name?: string) => {
    const value = (name || "").toLowerCase();
    if (value.includes("biz")) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }
    if (value.includes("group")) {
      return "border-purple-200 bg-purple-50 text-purple-700";
    }
    return "border-slate-200 bg-slate-100 text-slate-600";
  };

  const handleRename = async () => {
    if (!renameDialog.kb) return;
    const nextName = renameValue.trim();
    if (!nextName) {
      toast.error("Please enter a knowledge base name");
      return;
    }
    if (nextName === renameDialog.kb.name) {
      setRenameDialog({ open: false, kb: null });
      return;
    }
    try {
      await renameKnowledgeBase(renameDialog.kb.id, nextName);
      toast.success("Renamed");
      setRenameDialog({ open: false, kb: null });
      await loadKnowledgeBases(pageNo, keyword);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to rename"));
      console.error(error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Knowledge bases</h1>
          <p className="admin-page-subtitle">Manage knowledge bases and their documents</p>
        </div>
        <div className="admin-page-actions">
          <Input
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            placeholder="Search by name"
            className="w-[220px]"
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="admin-primary-gradient" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New knowledge base
          </Button>
        </div>
      </div>

      <div className="admin-stat-grid">
        {[
          { label: "Knowledge bases", value: stats.totalCount, icon: Database, scope: "All" },
          { label: "Documents", value: stats.documentCount, icon: FileBarChart, scope: "All" },
          { label: "With documents", value: stats.activeCount, icon: FolderOpen, scope: "All" },
          { label: "Creators", value: stats.creatorCount, icon: Layers, scope: "All" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="admin-stat-card">
              <div className="flex items-center gap-3">
                <div className="admin-stat-icon">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="admin-stat-label">{item.label}</div>
                  <div className="admin-stat-value">{formatStatValue(item.value)}</div>
                </div>
              </div>
              <span className="admin-stat-scope admin-stat-scope--stamp">{item.scope}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : knowledgeBases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No knowledge bases yet. Use the button above to create one.
            </div>
          ) : (
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[180px]">Embedding model</TableHead>
                  <TableHead className="w-[220px]">Collection</TableHead>
                  <TableHead className="w-[90px]">Documents</TableHead>
                  <TableHead className="w-[120px]">Owner</TableHead>
                  <TableHead className="w-[160px]">Created</TableHead>
                  <TableHead className="w-[160px]">Updated</TableHead>
                  <TableHead className="w-[150px] text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell className="font-medium">
                      <button
                        type="button"
                        className="admin-link max-w-[200px] truncate"
                        onClick={() => navigate(`/admin/knowledge/${kb.id}`)}
                      >
                        {kb.name}
                      </button>
                    </TableCell>
                    <TableCell>{renderEmbeddingModel(kb.embeddingModel)}</TableCell>
                    <TableCell>
                      {kb.collectionName ? (
                        <Badge
                          variant="outline"
                          className={cn("px-3 py-1", getCollectionBadgeClass(kb.collectionName))}
                        >
                          {kb.collectionName}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{kb.documentCount ?? "-"}</TableCell>
                    <TableCell>{kb.createdBy || "-"}</TableCell>
                    <TableCell>
                      <RelativeTime value={kb.createTime} />
                    </TableCell>
                    <TableCell>
                      <RelativeTime value={kb.updateTime} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRenameDialog({ open: true, kb });
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-0.1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(kb)}
                        >
                          <Trash2 className="w-4 h-4 mr-0.1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this knowledge base?</AlertDialogTitle>
            <AlertDialogDescription>
              This knowledge base cannot be restored. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ open, kb: open ? renameDialog.kb : null })}
      >
        <DialogContent
          className="sm:max-w-[420px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            requestAnimationFrame(() => (document.activeElement as HTMLElement)?.blur());
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename knowledge base</DialogTitle>
            <DialogDescription>Change the knowledge base name</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, kb: null })}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pageData ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>{pageData.total} total</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((prev) => Math.max(1, prev - 1))}
              disabled={pageData.current <= 1}
            >
              Previous
            </Button>
            <span>
              {pageData.current} / {pageData.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((prev) => Math.min(pageData.pages || 1, prev + 1))}
              disabled={pageData.current >= pageData.pages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* Create knowledge base dialog */}
      <CreateKnowledgeBaseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setPageNo(1);
          loadKnowledgeBases(1, keyword);
          loadStats(keyword);
        }}
      />
    </div>
  );
}
