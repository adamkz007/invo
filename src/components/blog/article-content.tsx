'use client';

import { ReactNode } from 'react';

interface ArticleContentProps {
  children: ReactNode;
}

export function ArticleContent({ children }: ArticleContentProps) {
  return (
    <div className="blog-post-prose">
      {children}
    </div>
  );
}

export function HighlightBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-primary/10 p-6 rounded-lg my-6">
      {children}
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 my-4">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="text-primary mr-2">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg font-medium text-primary">
      {children}
    </p>
  );
} 
