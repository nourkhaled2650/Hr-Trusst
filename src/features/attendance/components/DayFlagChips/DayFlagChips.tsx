type Props = {
  latenessMinutes: number;
  overtimeHours: number;
  hasManualSession: boolean;
  employmentType: "FULL_TIME" | "PART_TIME" | null;
};

const chipBase =
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium";

export function DayFlagChips({
  latenessMinutes,
  overtimeHours,
  hasManualSession,
  employmentType,
}: Props) {
  const isFullTime = employmentType === "FULL_TIME";
  const chips: React.ReactNode[] = [];

  if (isFullTime && latenessMinutes > 0) {
    chips.push(
      <span key="late" className={`${chipBase} bg-warning/10 text-warning-foreground`}>
        Late
      </span>,
    );
  }

  if (isFullTime && overtimeHours > 0) {
    chips.push(
      <span key="overtime" className={`${chipBase} bg-primary/10 text-primary`}>
        Overtime
      </span>,
    );
  }

  if (hasManualSession) {
    chips.push(
      <span key="manual" className={`${chipBase} bg-muted text-muted-foreground`}>
        Manual
      </span>,
    );
  }

  if (chips.length === 0) return null;

  return <div className="flex flex-wrap gap-1">{chips}</div>;
}
