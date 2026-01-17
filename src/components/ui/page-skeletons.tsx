import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type PageSkeletonProps = {
  label: string
  announce?: boolean
  className?: string
  children: React.ReactNode
}

function PageSkeleton({ label, announce = true, className, children }: PageSkeletonProps) {
  if (!announce) {
    return <div className={cn("w-full", className)}>{children}</div>
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("w-full", className)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

function TableSkeleton({
  rows = 8,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("rounded-md border", className)}>
      <div className="border-b bg-muted/40 p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40 hidden sm:block" />
            <Skeleton className="h-4 w-28 hidden md:block" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function InvoicesPageSkeleton({
  label = "Loading invoices",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-80 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center relative sm:col-span-2">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      <TableSkeleton rows={9} />
    </PageSkeleton>
  )
}

export function CustomersPageSkeleton({
  label = "Loading customers",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full max-w-xl" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    </PageSkeleton>
  )
}

export function ReceiptsPageSkeleton({
  label = "Loading receipts",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <TableSkeleton rows={8} />
    </PageSkeleton>
  )
}

export function InventoryPageSkeleton({
  label = "Loading inventory",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-10 w-full sm:col-span-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      <TableSkeleton rows={10} />
    </PageSkeleton>
  )
}

export function SettingsPageSkeleton({
  label = "Loading settings",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-72 max-w-[70vw]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </PageSkeleton>
  )
}

export function DashboardPageSkeleton({
  label = "Loading dashboard",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-72 max-w-[70vw]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </PageSkeleton>
  )
}

export function AuthPageSkeleton({
  label = "Loading authentication",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton
      label={label}
      announce={announce}
      className="flex min-h-screen items-center justify-center p-4"
    >
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </PageSkeleton>
  )
}

export function HomePageSkeleton({
  label = "Loading home page",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <Skeleton className="h-10 w-5/6" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 w-full sm:w-40" />
              <Skeleton className="h-11 w-full sm:w-40" />
            </div>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <Skeleton className="h-72 w-full" />
          </div>
        </div>

        <div className="mt-14 space-y-6">
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-lg border p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageSkeleton>
  )
}

export function GenericPageSkeleton({
  label = "Loading page",
  announce = true,
}: {
  label?: string
  announce?: boolean
}) {
  return (
    <PageSkeleton label={label} announce={announce} className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-[70vw]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </PageSkeleton>
  )
}

export function DashboardFrameSkeleton({
  children,
  label = "Loading",
}: {
  children: React.ReactNode
  label?: string
}) {
  return (
    <PageSkeleton label={label} className="min-h-screen">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-14 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 h-[calc(100vh-4rem)]">
          <aside className="hidden md:block md:w-64 border-r bg-muted/40">
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-md px-3 py-2">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
              <div className="pt-4">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </aside>
          <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </PageSkeleton>
  )
}

export function skeletonForPathname(pathname: string) {
  if (pathname === "/" || pathname === "/home" || pathname === "/landing") {
    return <HomePageSkeleton />
  }
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return <AuthPageSkeleton />
  }
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/accounting") ||
    pathname.startsWith("/pos") ||
    pathname.startsWith("/receipts")
  ) {
    if (pathname.startsWith("/invoices")) return <InvoicesPageSkeleton />
    if (pathname.startsWith("/customers")) return <CustomersPageSkeleton />
    if (pathname.startsWith("/receipts")) return <ReceiptsPageSkeleton />
    if (pathname.startsWith("/inventory")) return <InventoryPageSkeleton />
    if (pathname.startsWith("/settings")) return <SettingsPageSkeleton />
    if (pathname.startsWith("/dashboard")) return <DashboardPageSkeleton />
    return (
      <DashboardFrameSkeleton>
        <GenericPageSkeleton announce={false} />
      </DashboardFrameSkeleton>
    )
  }
  return <GenericPageSkeleton />
}
