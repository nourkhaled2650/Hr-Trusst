import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AdjustmentList } from "./AdjustmentList";
import { AdjustmentAddForm } from "./AdjustmentAddForm";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type AdjustmentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  employeeId: number;
  employeeName: string;
  monthYear: string;
  isReadOnly: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdjustmentSheet({
  open,
  onOpenChange,
  year,
  month,
  employeeId,
  employeeName,
  monthYear,
  isReadOnly,
}: AdjustmentSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Adjustments — {employeeName}</SheetTitle>
          <SheetDescription>{monthYear}</SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {/* Section A — existing adjustments */}
          <AdjustmentList
            year={year}
            month={month}
            employeeId={employeeId}
            isReadOnly={isReadOnly}
          />

          {/* Section B — add form (hidden when read-only) */}
          {!isReadOnly && (
            <>
              <Separator />
              <AdjustmentAddForm
                year={year}
                month={month}
                employeeId={employeeId}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
