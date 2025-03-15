'use client';

import { ToastContainer } from "@/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastContainer>{children}</ToastContainer>;
} 