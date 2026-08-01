import Link from 'next/link';
import type { ElementType } from 'react';
import {
  BookOpen,
  FileText,
  Users,
  Receipt,
  Package,
  ShoppingCart,
  Calculator,
  Settings,
  Zap,
  HelpCircle,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import { docCategories, getDocPagesByCategory } from '@/lib/docs';

const categoryIcons: Record<string, ElementType> = {
  basics: BookOpen,
  core: FileText,
  modules: Calculator,
  compliance: Settings,
  help: HelpCircle,
};

const pageIcons: Record<string, ElementType> = {
  'getting-started': Zap,
  dashboard: LayoutDashboard,
  invoices: FileText,
  customers: Users,
  receipts: Receipt,
  inventory: Package,
  pos: ShoppingCart,
  accounting: Calculator,
  'accounting-transactions': Calculator,
  'accounting-expenses': Calculator,
  'accounting-reports': Calculator,
  'accounting-reconciliation': Calculator,
  settings: Settings,
  'e-invoice': FileText,
  subscription: Zap,
  faq: HelpCircle,
};

export default function DocsHubPage() {
  return (
    <div>
      <div className="docs-hero">
        <h1 className="docs-hero-title">Invo User Guide</h1>
        <p className="docs-hero-description">
          Everything you need to invoice smarter, manage customers, and grow your Malaysian business.
          Search with <kbd className="docs-kbd">⌘K</kbd> or browse by topic below.
        </p>
      </div>

      <div className="space-y-12">
        {docCategories.map((category) => {
          const pages = getDocPagesByCategory(category.slug);
          const CategoryIcon = categoryIcons[category.slug] ?? BookOpen;

          return (
            <section key={category.slug}>
              <div className="flex items-center gap-3 mb-4">
                <div className="docs-category-icon">
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {pages.map((page) => {
                  const PageIcon = pageIcons[page.slug] ?? FileText;
                  return (
                    <Link
                      key={page.slug}
                      href={`/docs/${page.slug}`}
                      className="docs-card group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="docs-card-icon">
                          <PageIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {page.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {page.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
