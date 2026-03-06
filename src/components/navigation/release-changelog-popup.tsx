'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RELEASE_ID = '2026-03-07';
const RELEASE_DATE_LABEL = '7 Mar 2026';
const RELEASE_STORAGE_KEY = 'invo:release-popup:last-seen';
const RELEASE_UPDATES = [
  'Updated invoice PDF layout',
  'Filter dashboard by time range',
];

interface ReleaseChangelogPopupProps {
  userId?: string;
}

export function ReleaseChangelogPopup({ userId }: ReleaseChangelogPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = useMemo(
    () => (userId ? `${RELEASE_STORAGE_KEY}:${userId}` : RELEASE_STORAGE_KEY),
    [userId]
  );

  const dismissPopup = useCallback(() => {
    try {
      localStorage.setItem(storageKey, RELEASE_ID);
    } catch (error) {
      console.error('Failed to save release popup state:', error);
    } finally {
      setIsVisible(false);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      const lastSeenRelease = localStorage.getItem(storageKey);
      setIsVisible(lastSeenRelease !== RELEASE_ID);
    } catch (error) {
      console.error('Failed to read release popup state:', error);
      setIsVisible(true);
    }
  }, [storageKey]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-20 z-40 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]">
      <Card
        className="pointer-events-auto gap-4 border-primary/30 py-4 shadow-xl"
        role="dialog"
        aria-label="Release updates"
      >
        <CardHeader className="px-4 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                What&apos;s New
              </CardTitle>
              <p className="text-xs text-muted-foreground">{RELEASE_DATE_LABEL}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={dismissPopup}
              aria-label="Dismiss release updates"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4">
          <ul className="space-y-1.5 pl-5 text-sm text-muted-foreground list-disc">
            {RELEASE_UPDATES.map((update) => (
              <li key={update}>{update}</li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/changelog" onClick={dismissPopup}>
                View changelog
              </Link>
            </Button>
            <Button type="button" size="sm" onClick={dismissPopup}>
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
