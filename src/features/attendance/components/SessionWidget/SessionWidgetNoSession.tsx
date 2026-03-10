import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onStartSession: () => void;
  variant?: "navbar" | "sheet";
};

export function SessionWidgetNoSession({ onStartSession, variant = "navbar" }: Props) {
  if (variant === "sheet") {
    return (
      <Button
        variant="default"
        size="sm"
        className="w-full justify-start"
        onClick={onStartSession}
      >
        <Play className="h-4 w-4 mr-1.5" />
        Start Session
      </Button>
    );
  }

  return (
    <>
      {/* Desktop */}
      <Button
        variant="default"
        size="sm"
        className="hidden sm:flex"
        onClick={onStartSession}
      >
        <Play className="h-4 w-4 mr-1.5" />
        Start Session
      </Button>

      {/* Mobile icon-only (below sm breakpoint) */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="sm:hidden h-8 w-8"
              onClick={onStartSession}
              aria-label="Start Session"
            >
              <Play className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start Session</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
