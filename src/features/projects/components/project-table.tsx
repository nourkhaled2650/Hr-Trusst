import { useState, useMemo } from "react";
import { Plus, ChevronRight, FolderKanban, SearchX, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectStatusBadge } from "./project-status-badge";
import type { Project, ProjectStatus } from "../types/projects.types";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "./use-debounce";

type StatusFilter = "" | ProjectStatus;

type Props = {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  onNavigate: (project: Project) => void;
  onCreateClick: () => void;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export function ProjectTable({
  projects,
  isLoading,
  isError,
  onNavigate,
  onCreateClick,
}: Props) {
  const [searchRaw, setSearchRaw] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const search = useDebounce(searchRaw, 200);

  const filtered = useMemo(() => {
    const lc = search.toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        lc === "" ||
        p.projectName.toLowerCase().includes(lc) ||
        p.projectCode.toLowerCase().includes(lc);
      const matchesStatus = statusFilter === "" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filtered.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize,
  );

  const handleStatusFilterChange = (v: string) => {
    setStatusFilter(v as StatusFilter);
    setPageIndex(0);
  };

  const handleSearchChange = (v: string) => {
    setSearchRaw(v);
    setPageIndex(0);
  };

  const handlePageSizeChange = (v: string) => {
    setPageSize(Number(v));
    setPageIndex(0);
  };

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search by name or code..."
          value={searchRaw}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 max-w-xs"
        />
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table area */}
      {isError ? (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load projects. Please refresh the page.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-muted-foreground">
            No projects yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Create your first project to get started.
          </p>
          <Button
            className="mt-6"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No projects match your search
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-28">Start</TableHead>
                  <TableHead className="w-28">End</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((project) => (
                  <TableRow
                    key={Number(project.projectId)}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate(project)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.projectName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {project.projectCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {project.description ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(project.startDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(project.endDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(project);
                        }}
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Page {safePageIndex + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                }
                disabled={safePageIndex >= pageCount - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
