'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ArticleContentProps {
  children: ReactNode;
}

export function ArticleContent({ children }: ArticleContentProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="prose prose-lg prose-blue max-w-none"
    >
      {children}
    </motion.div>
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