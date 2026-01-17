"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"

type NavigationSkeletonOverlayProps = {
  delayMs?: number
  maxWaitMs?: number
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function PulseBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "animate-pulse motion-reduce:animate-none rounded-md bg-muted/70 dark:bg-muted/40",
        className
      )}
    />
  )
}

function MinimalOverlaySkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cx("w-full", compact ? "" : "p-4 md:p-6")}>
      <div className="space-y-4">
        <PulseBlock className="h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <PulseBlock className="h-8 w-40" />
          <PulseBlock className="h-9 w-28" />
        </div>
        <PulseBlock className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PulseBlock className="h-24 w-full" />
          <PulseBlock className="h-24 w-full" />
          <PulseBlock className="h-24 w-full hidden lg:block" />
        </div>
        <PulseBlock className="h-56 w-full" />
      </div>
    </div>
  )
}

function shouldStartFromClick(event: MouseEvent) {
  if (event.defaultPrevented) return false
  if (event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  return true
}

function getNextPathnameFromClickTarget(target: EventTarget | null) {
  if (!target || !(target instanceof Element)) return null
  if (target.closest("[data-no-nav-skeleton]")) return null

  const anchor = target.closest("a")
  if (!anchor) return null
  if (anchor.getAttribute("target") && anchor.getAttribute("target") !== "_self") return null
  if (anchor.hasAttribute("download")) return null

  const href = anchor.getAttribute("href")
  if (!href) return null
  if (href.startsWith("#")) return null

  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return null

    const current = `${window.location.pathname}${window.location.search}`
    const next = `${url.pathname}${url.search}`
    if (current === next) return null

    return url.pathname
  } catch {
    return null
  }
}

export function NavigationSkeletonOverlay({
  delayMs = 350,
  maxWaitMs = 15000,
}: NavigationSkeletonOverlayProps) {
  const pathname = usePathname()
  const pendingTokenRef = React.useRef(0)
  const [isRendered, setIsRendered] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [targetPathname, setTargetPathname] = React.useState<string | null>(null)
  const [timedOut, setTimedOut] = React.useState(false)
  const [portalEl, setPortalEl] = React.useState<Element | null>(null)

  React.useEffect(() => {
    setPortalEl(document.getElementById("nav-skeleton-portal"))
  }, [pathname])

  React.useEffect(() => {
    pendingTokenRef.current += 1
    setIsVisible(false)
    if (isRendered) {
      const t = window.setTimeout(() => setIsRendered(false), 200)
      return () => window.clearTimeout(t)
    }
  }, [pathname, isRendered])

  React.useEffect(() => {
    if (!isRendered) {
      setTargetPathname(null)
      setTimedOut(false)
    }
  }, [isRendered])

  React.useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!shouldStartFromClick(event)) return

      const next = getNextPathnameFromClickTarget(event.target)
      if (!next) return

      const token = pendingTokenRef.current + 1
      pendingTokenRef.current = token
      setTargetPathname(next)
      window.setTimeout(() => {
        if (pendingTokenRef.current !== token) return
        setIsRendered(true)
        requestAnimationFrame(() => setIsVisible(true))
      }, delayMs)
    }

    const popstateHandler = () => {
      const next = window.location.pathname
      if (next === pathname) return
      const token = pendingTokenRef.current + 1
      pendingTokenRef.current = token
      setTargetPathname(next)
      window.setTimeout(() => {
        if (pendingTokenRef.current !== token) return
        setIsRendered(true)
        requestAnimationFrame(() => setIsVisible(true))
      }, delayMs)
    }

    document.addEventListener("click", clickHandler, { capture: true })
    window.addEventListener("popstate", popstateHandler)

    return () => {
      document.removeEventListener("click", clickHandler, { capture: true } as any)
      window.removeEventListener("popstate", popstateHandler)
    }
  }, [delayMs, pathname])

  React.useEffect(() => {
    if (!isRendered) return
    const t = window.setTimeout(() => setTimedOut(true), maxWaitMs)
    return () => window.clearTimeout(t)
  }, [isRendered, maxWaitMs])

  if (!isRendered) return null

  const mode: "portal" | "fixed" = portalEl ? "portal" : "fixed"

  const overlay = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cx(
        mode === "portal"
          ? "absolute inset-0 z-50 bg-background"
          : "fixed inset-0 z-50 bg-background",
        "transition-opacity duration-200 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="sr-only">Loading…</span>
      <div className="h-full w-full">
        {timedOut ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-semibold">Still loading</div>
                <div className="text-sm text-muted-foreground">
                  This is taking longer than expected.
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium"
                  onClick={() => window.history.back()}
                >
                  Go back
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MinimalOverlaySkeleton compact={mode === "portal"} />
        )}
      </div>
    </div>
  )

  if (portalEl) {
    return createPortal(overlay, portalEl)
  }

  return overlay
}
