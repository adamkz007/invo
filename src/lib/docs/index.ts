import { docCategories } from './categories';
import { gettingStartedPage, dashboardPage } from './pages/basics';
import { invoicesPage, customersPage } from './pages/core';
import {
  receiptsPage,
  inventoryPage,
  posPage,
  accountingPage,
  accountingTransactionsPage,
  accountingExpensesPage,
  accountingReportsPage,
  accountingReconciliationPage,
} from './pages/modules';
import {
  settingsPage,
  eInvoicePage,
  subscriptionPage,
  faqPage,
} from './pages/compliance';
import type { DocPage, DocSearchResult } from './types';

export const allDocPages: DocPage[] = [
  gettingStartedPage,
  dashboardPage,
  invoicesPage,
  customersPage,
  receiptsPage,
  inventoryPage,
  posPage,
  accountingPage,
  accountingTransactionsPage,
  accountingExpensesPage,
  accountingReportsPage,
  accountingReconciliationPage,
  settingsPage,
  eInvoicePage,
  subscriptionPage,
  faqPage,
];

export function getDocPage(slug: string): DocPage | undefined {
  return allDocPages.find((page) => page.slug === slug);
}

export function getDocPagesByCategory(categorySlug: string): DocPage[] {
  return allDocPages
    .filter((page) => page.categorySlug === categorySlug)
    .sort((a, b) => a.order - b.order);
}

export function getRelatedPages(slug: string): DocPage[] {
  const page = getDocPage(slug);
  if (!page?.relatedSlugs) return [];
  return page.relatedSlugs
    .map((s) => getDocPage(s))
    .filter((p): p is DocPage => p !== undefined);
}

function extractSearchableText(page: DocPage): string {
  return page.blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
          return block.text;
        case 'list':
          return block.items.join(' ');
        case 'callout':
          return `${block.title ?? ''} ${block.text}`;
        case 'steps':
          return block.items.map((s) => `${s.title} ${s.content}`).join(' ');
        case 'screenshot':
          return `${block.alt} ${block.caption}`;
        default:
          return '';
      }
    })
    .join(' ');
}

export function searchDocs(query: string): DocSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: DocSearchResult[] = [];

  for (const page of allDocPages) {
    const searchable = [
      page.title,
      page.description,
      page.category,
      ...page.keywords,
      extractSearchableText(page),
    ]
      .join(' ')
      .toLowerCase();

    if (searchable.includes(normalized)) {
      results.push({
        slug: page.slug,
        title: page.title,
        description: page.description,
        category: page.category,
      });
      continue;
    }

    // Word-level partial match
    const words = normalized.split(/\s+/);
    const matchCount = words.filter((word) => searchable.includes(word)).length;
    if (matchCount >= Math.ceil(words.length * 0.6)) {
      results.push({
        slug: page.slug,
        title: page.title,
        description: page.description,
        category: page.category,
      });
    }
  }

  return results;
}

export { docCategories };
