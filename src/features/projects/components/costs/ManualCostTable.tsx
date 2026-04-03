import { useState } from "react";
import { Pencil, Trash2, Receipt, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useManualCosts } from "../../hooks/use-manual-costs";
import { useDeleteManualCost } from "../../hooks/use-delete-manual-cost";
import { useCostCategories } from "../../hooks/use-cost-categories";
import type { ManualCostEntry } from "../../types/projects.types";
import { ManualCostDialog } from "./ManualCostDialog";
import { AddCostCategoryDialog } from "./AddCostCategoryDialog";

type Props = {
  projectId: string;
};

function getCategoryName(categoryId: number, categories: Array<{ categoryId: number; categoryName: string }> | undefined): string {
  return categories?.find((c) => c.categoryId === categoryId)?.categoryName ?? String(categoryId);
}

export function ManualCostTable({ projectId }: Props) {
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [editEntry, setEditEntry]         = useState<ManualCostEntry | undefined>(undefined);
  const [deleteEntry, setDeleteEntry]     = useState<ManualCostEntry | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const { data: costs, isLoading }        = useManualCosts(projectId);
  const { data: categories }              = useCostCategories();
  const deleteMutation                    = useDeleteManualCost(projectId);

  const sorted = [...(costs ?? [])].sort(
    (a, b) => new Date(b.costDate).getTime() - new Date(a.costDate).getTime(),
  );

  const openAdd = () => {
    setEditEntry(undefined);
    setDialogOpen(true);
  };

  const openEdit = (entry: ManualCostEntry) => {
    setEditEntry(entry);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteEntry) return;
    deleteMutation.mutate(deleteEntry.costId, {
      onSuccess: () => {
        toast.success("Cost entry deleted");
        setDeleteEntry(null);
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Manual Costs</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCategoryDialogOpen(true)}>
                Add Category
              </Button>
              <Button variant="outline" size="sm" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Cost
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No manual costs recorded yet.</p>
              <Button variant="outline" size="sm" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Cost
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((entry) => (
                  <TableRow key={entry.costId}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(entry.costDate)}
                    </TableCell>
                    <TableCell>
                      {/* cost category colors — no semantic token */}
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                        {getCategoryName(entry.categoryId, categories)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium whitespace-nowrap">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(entry)}
                          aria-label="Edit cost entry"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteEntry(entry)}
                          aria-label="Delete cost entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      <ManualCostDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEntry={editEntry}
      />

      <AddCostCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteEntry !== null} onOpenChange={(open) => { if (!open) setDeleteEntry(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this cost entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
