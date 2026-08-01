'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { docCategories, getDocPagesByCategory } from '@/lib/docs';

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="docs-sidebar" aria-label="Documentation navigation">
      {docCategories.map((category) => {
        const pages = getDocPagesByCategory(category.slug);
        if (pages.length === 0) return null;

        return (
          <div key={category.slug} className="mb-6">
            <h3 className="docs-sidebar-heading">{category.title}</h3>
            <ul className="space-y-0.5">
              {pages.map((page) => {
                const href = `/docs/${page.slug}`;
                const isActive = pathname === href;

                return (
                  <li key={page.slug}>
                    <Link
                      href={href}
                      className={cn(
                        'docs-sidebar-link',
                        isActive && 'docs-sidebar-link-active'
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
