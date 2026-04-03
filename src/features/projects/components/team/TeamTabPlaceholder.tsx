import { Users } from "lucide-react";

export function TeamTabPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="h-10 w-10 mb-3 text-muted-foreground opacity-40" />
      <p className="text-sm font-medium text-muted-foreground">Team data is loading.</p>
      <p className="text-xs text-muted-foreground mt-1 opacity-70">Team management will be available in the next phase.</p>
    </div>
  );
}
