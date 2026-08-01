export type DocBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; variant: 'tip' | 'note' | 'warning'; title?: string; text: string }
  | { type: 'screenshot'; src: string; alt: string; caption: string }
  | { type: 'steps'; items: { title: string; content: string }[] };

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  order: number;
  keywords: string[];
  blocks: DocBlock[];
  relatedSlugs?: string[];
}

export interface DocCategory {
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface DocSearchResult {
  slug: string;
  title: string;
  description: string;
  category: string;
  matchedText?: string;
}
