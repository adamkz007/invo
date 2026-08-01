import Image from 'next/image';
import { Lightbulb, Info, AlertTriangle } from 'lucide-react';
import type { DocBlock } from '@/lib/docs/types';
import { cn } from '@/lib/utils';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function CalloutIcon({ variant }: { variant: 'tip' | 'note' | 'warning' }) {
  switch (variant) {
    case 'tip':
      return <Lightbulb className="h-5 w-5 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 shrink-0" />;
    default:
      return <Info className="h-5 w-5 shrink-0" />;
  }
}

function DocBlockRenderer({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'heading': {
      const id = block.id ?? slugify(block.text);
      if (block.level === 2) {
        return (
          <h2 id={id} className="docs-h2">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 id={id} className="docs-h3">
          {block.text}
        </h3>
      );
    }

    case 'paragraph':
      return <p className="docs-paragraph">{block.text}</p>;

    case 'list':
      if (block.ordered) {
        return (
          <ol className="docs-list docs-list-ordered">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="docs-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'callout':
      return (
        <div
          className={cn(
            'docs-callout',
            block.variant === 'tip' && 'docs-callout-tip',
            block.variant === 'note' && 'docs-callout-note',
            block.variant === 'warning' && 'docs-callout-warning'
          )}
        >
          <CalloutIcon variant={block.variant} />
          <div>
            {block.title && <p className="docs-callout-title">{block.title}</p>}
            <p className="docs-callout-text">{block.text}</p>
          </div>
        </div>
      );

    case 'screenshot':
      return (
        <figure className="docs-screenshot">
          <div className="docs-screenshot-frame">
            <Image
              src={block.src}
              alt={block.alt}
              width={1280}
              height={720}
              className="w-full h-auto"
            />
          </div>
          <figcaption>{block.caption}</figcaption>
        </figure>
      );

    case 'steps':
      return (
        <ol className="docs-steps">
          {block.items.map((step, i) => (
            <li key={i} className="docs-step">
              <span className="docs-step-number">{i + 1}</span>
              <div>
                <p className="docs-step-title">{step.title}</p>
                <p className="docs-step-content">{step.content}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    default:
      return null;
  }
}

export function DocsContent({ blocks }: { blocks: DocBlock[] }) {
  return (
    <article className="docs-content">
      {blocks.map((block, i) => (
        <DocBlockRenderer key={i} block={block} />
      ))}
    </article>
  );
}

export function DocsTableOfContents({ blocks }: { blocks: DocBlock[] }) {
  const headings = blocks.filter(
    (b): b is Extract<DocBlock, { type: 'heading' }> =>
      b.type === 'heading' && b.level === 2
  );

  if (headings.length === 0) return null;

  return (
    <nav className="docs-toc" aria-label="On this page">
      <p className="docs-toc-heading">On this page</p>
      <ul>
        {headings.map((heading) => {
          const id = heading.id ?? slugify(heading.text);
          return (
            <li key={id}>
              <a href={`#${id}`} className="docs-toc-link">
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
