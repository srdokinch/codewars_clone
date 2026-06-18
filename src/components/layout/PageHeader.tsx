import ThemeToggle from "@/components/theme/ThemeToggle";

interface PageHeaderProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
}

export default function PageHeader({
  children,
  actions,
  compact = false,
}: PageHeaderProps) {
  return (
    <div
      className={
        compact
          ? "border-b border-codewars-border bg-codewars-surface px-6 py-3"
          : "border-b border-codewars-border bg-codewars-surface px-8 py-6"
      }
    >
      <div
        className={`flex justify-between gap-4 ${compact ? "items-center" : "items-start"}`}
      >
        {children ? <div className="min-w-0 flex-1">{children}</div> : <div />}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </div>
  );
}
