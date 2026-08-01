'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { searchDocs } from '@/lib/docs';

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const results = query.trim() ? searchDocs(query) : [];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery('');
      router.push(`/docs/${slug}`);
    },
    [router]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="docs-search-trigger"
        aria-label="Search documentation"
      >
        <Search className="h-4 w-4 shrink-0 opacity-50" />
        <span className="flex-1 text-left">Search docs…</span>
        <kbd className="hidden sm:inline-flex docs-kbd">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search documentation…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((result) => (
                <CommandItem
                  key={result.slug}
                  value={result.slug}
                  onSelect={() => navigate(result.slug)}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.category} — {result.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
