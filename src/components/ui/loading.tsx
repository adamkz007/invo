import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
}

export function Loading({ 
  text = "Loading...", 
  className,
  size = "md",
  variant = "default"
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex justify-center items-center p-4", className)}>
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-primary",
          sizeClasses[size]
        )} />
        {text && <span className="ml-3 text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-[calc(100vh-100px)] items-center justify-center",
      className
    )}>
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={cn(
          "mb-4 animate-spin rounded-full border-b-2 border-primary mx-auto",
          sizeClasses[size]
        )} />
        <p className="text-muted-foreground font-medium">{text}</p>
      </div>
    </div>
  );
}

// Specific loading components for different sections
export function DashboardLoading() {
  return <Loading text="Loading dashboard..." />;
}

export function CustomersLoading() {
  return <Loading text="Loading customers..." />;
}

export function InventoryLoading() {
  return <Loading text="Loading inventory..." />;
}

export function InvoicesLoading() {
  return <Loading text="Loading invoices..." />;
}

export function ReceiptsLoading() {
  return <Loading text="Loading receipts..." />;
}

// Minimal loading for inline use
export function InlineLoading({ text }: { text?: string }) {
  return <Loading text={text} variant="minimal" size="sm" />;
}

export function CustomerEditLoading() {
  return <Loading text="Loading customer..." />;
}

export function SettingsLoading() {
  return <Loading text="Loading settings..." />;
}