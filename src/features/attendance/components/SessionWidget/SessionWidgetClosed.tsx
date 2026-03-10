import { Play, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onStartSession: () => void;
  onEndDay: () => void;
  variant?: "navbar" | "sheet";
};

export function SessionWidgetClosed({ onStartSession, onEndDay, variant = "navbar" }: Props) {
  if (variant === "sheet") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={onStartSession}
        >
          <Play className="h-4 w-4 mr-1.5" />
          Start Session
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full justify-start"
          onClick={onEndDay}
        >
          <CheckSquare className="h-4 w-4 mr-1.5" />
          End Day
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Desktop — both labels */}
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex"
        onClick={onStartSession}
      >
        <Play className="h-4 w-4 mr-1.5" />
        Start Session
      </Button>
      <Button
        variant="default"
        size="sm"
        className="hidden md:flex"
        onClick={onEndDay}
      >
        <CheckSquare className="h-4 w-4 mr-1.5" />
        End Day
      </Button>

      {/* Mobile — icon-only with tooltips */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={onStartSession}
              aria-label="Start Session"
            >
              <Play className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start Session</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={onEndDay}
              aria-label="End Day"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>End Day</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
