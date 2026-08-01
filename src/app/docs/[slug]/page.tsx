import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { DocsBreadcrumb } from '@/components/docs/docs-shell';
import { DocsContent, DocsTableOfContents } from '@/components/docs/docs-content';
import { allDocPages, getDocPage, getRelatedPages } from '@/lib/docs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allDocPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) return { title: 'Not Found | Invo Docs' };

  return {
    title: `${page.title} | Invo Docs`,
    description: page.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();

  const related = getRelatedPages(slug);

  return (
    <div className="docs-page">
      <DocsBreadcrumb category={page.category} title={page.title} />

      <div className="docs-page-header">
        <h1 className="docs-page-title">{page.title}</h1>
        <p className="docs-page-description">{page.description}</p>
      </div>

      <div className="docs-page-body">
        <DocsContent blocks={page.blocks} />
        <DocsTableOfContents blocks={page.blocks} />
      </div>

      {related.length > 0 && (
        <section className="docs-related">
          <h2 className="text-lg font-semibold mb-4">Related guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((rel) => (
              <Link key={rel.slug} href={`/docs/${rel.slug}`} className="docs-card group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {rel.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="docs-page-nav">
        <Link href="/docs" className="text-sm text-primary hover:underline">
          ← Back to all docs
        </Link>
      </div>
    </div>
  );
}
