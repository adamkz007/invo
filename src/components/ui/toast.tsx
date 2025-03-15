'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  showToast: (props: ToastProps) => void;
  hideToast: () => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastVariants = cva(
  "fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out z-50",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border border-gray-200",
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  className,
  variant,
  message,
  duration = 3000,
  onClose,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-1 p-4">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose?.()}
        className="p-2 rounded-full hover:bg-black/10 transition-colors"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastProps | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  
  const showToast = React.useCallback((props: ToastProps) => {
    setToast(props);
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setToast(null), 300); // Wait for fade out animation
    }, props.duration || 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const hideToast = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setToast(null), 300);
  }, []);
  
  const value = React.useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          {...toast}
          className={`${isVisible ? 'opacity-100' : 'opacity-0'}`}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
} 