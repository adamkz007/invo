import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { DocsSidebar } from './docs-sidebar';
import { DocsSearch } from './docs-search';

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-shell min-h-screen bg-background">
      <header className="docs-header">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="docs-back-link">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link href="/docs" className="flex items-center gap-2 font-semibold text-primary">
              <BookOpen className="h-5 w-5" />
              <span>Invo Docs</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48 sm:w-64">
              <DocsSearch />
            </div>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="docs-layout">
          <aside className="docs-aside">
            <DocsSidebar />
          </aside>
          <main className="docs-main">{children}</main>
        </div>
      </div>

      <footer className="docs-footer">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Need more help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link></p>
          <div className="flex items-center gap-4">
            <Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function DocsBreadcrumb({
  category,
  title,
}: {
  category: string;
  title: string;
}) {
  return (
    <nav className="docs-breadcrumb" aria-label="Breadcrumb">
      <Link href="/docs">Docs</Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="text-muted-foreground">{category}</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>{title}</span>
    </nav>
  );
}
