import { useState, useMemo } from "react";
import { Plus, Users, SearchX, AlertCircle } from "lucide-react";
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
import type { Employee } from "../types/employee.types";
import {
  EmployeeNameCell,
  EmployeeTypeBadge,
  EmployeeRowAction,
} from "./employee-columns";
import { useDebounce } from "../hooks/use-debounce";

type EmployeeTypeFilter = "" | "FULL_TIME" | "PART_TIME";

type Props = {
  employees: Employee[];
  isLoading: boolean;
  isError: boolean;
  onNavigate: (employee: Employee) => void;
  onCreateClick: () => void;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export function EmployeeTable({
  employees,
  isLoading,
  isError,
  onNavigate,
  onCreateClick,
}: Props) {
  const [searchRaw, setSearchRaw] = useState("");
  const [typeFilter, setTypeFilter] = useState<EmployeeTypeFilter>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const search = useDebounce(searchRaw, 200);

  const filtered = useMemo(() => {
    const lc = search.toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        lc === "" ||
        (e.firstName?.toLowerCase().includes(lc) ?? false) ||
        (e.lastName?.toLowerCase().includes(lc) ?? false) ||
        e.email.toLowerCase().includes(lc) ||
        (e.position?.toLowerCase().includes(lc) ?? false);

      const matchesType = typeFilter === "" || e.employeeType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [employees, search, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filtered.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize,
  );

  const handleTypeFilterChange = (v: string) => {
    setTypeFilter(v as EmployeeTypeFilter);
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
          placeholder="Search by name, email, or position..."
          value={searchRaw}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 max-w-xs"
        />
        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL_TIME">Full-time</SelectItem>
            <SelectItem value="PART_TIME">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table area */}
      {isError ? (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load employees. Please refresh the page.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-muted-foreground">
            No employees yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Add your first employee to get started.
          </p>
          <Button
            className="mt-6 bg-brand hover:bg-brand-hover"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4 mr-2" /> New Employee
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No employees match your search
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-40">Position</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((employee) => (
                  <TableRow
                    key={Number(employee.employeeId)}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate(employee)}
                  >
                    <TableCell>
                      <EmployeeNameCell employee={employee} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {employee.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {employee.position ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EmployeeTypeBadge type={employee.employeeType} />
                    </TableCell>
                    <TableCell>
                      <EmployeeRowAction
                        employee={employee}
                        onNavigate={onNavigate}
                      />
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
