import { Receipt } from "lucide-react";

export function CostsTabPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Receipt className="h-10 w-10 mb-3 text-muted-foreground opacity-40" />
      <p className="text-sm font-medium text-muted-foreground">Cost data is not yet available.</p>
      <p className="text-xs text-muted-foreground mt-1 opacity-70">The cost tracking backend is under development.</p>
    </div>
  );
}
