import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Disclaimer/Warning Box Component
interface DisclaimerBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ children, className }) => (
  <div className={cn("bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8", className)}>
    <div className="text-sm text-yellow-800">
      {children}
    </div>
  </div>
);

// Information Box Component
interface InfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ children, className }) => (
  <div className={cn("bg-primary/5 p-6 rounded-lg my-6", className)}>
    {children}
  </div>
);

// Tip Box Component
interface TipBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const TipBox: React.FC<TipBoxProps> = ({ children, className }) => (
  <div className={cn("bg-blue-50 border-l-4 border-blue-400 p-5 my-8", className)}>
    <div className="text-sm text-blue-800">
      {children}
    </div>
  </div>
);

// Check List Component
interface CheckListProps {
  items: string[];
  className?: string;
}

export const CheckList: React.FC<CheckListProps> = ({ items, className }) => (
  <ul className={cn("space-y-2 my-6", className)}>
    {items.map((item, index) => (
      <li key={index} className="flex items-start">
        <span className="text-primary mr-2">✓</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// Numbered Steps Component
interface Step {
  title: string;
  description: string;
}

interface NumberedStepsProps {
  steps: Step[];
  className?: string;
}

export const NumberedSteps: React.FC<NumberedStepsProps> = ({ steps, className }) => (
  <ol className={cn("space-y-4 my-6 list-none pl-0", className)}>
    {steps.map((step, index) => (
      <li key={index} className="flex items-start">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">
          {index + 1}
        </span>
        <div>
          <strong>{step.title}:</strong> {step.description}
        </div>
      </li>
    ))}
  </ol>
);

// Article Container Component
interface ArticleContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ArticleContainer: React.FC<ArticleContainerProps> = ({ children, className }) => (
  <article className={cn("container mx-auto px-4 py-12", className)}>
    <div className="max-w-3xl mx-auto">
      <div className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl prose-p:text-base prose-p:leading-relaxed prose-li:text-base prose-li:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-strong:font-bold">
        {children}
      </div>
    </div>
  </article>
);

// Content Grid Component
interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ children, columns = 2, className }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3'
  };

  return (
    <div className={cn(`grid ${gridCols[columns]} gap-8 my-8`, className)}>
      {children}
    </div>
  );
};

// Captioned Figure Component
interface CaptionedFigureProps {
  children: React.ReactNode;
  caption: string;
  className?: string;
}

export const CaptionedFigure: React.FC<CaptionedFigureProps> = ({ children, caption, className }) => (
  <figure className={cn("my-6", className)}>
    {children}
    <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
      {caption}
    </figcaption>
  </figure>
);

// Placeholder Image Component
interface PlaceholderImageProps {
  alt: string;
  className?: string;
  height?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  alt, 
  className, 
  height = "h-64" 
}) => (
  <div className={cn("overflow-hidden rounded-md bg-muted", className)}>
    <div className={cn(`flex items-center justify-center bg-muted text-muted-foreground ${height} w-full`)}>
      {alt}
    </div>
  </div>
);

// Share Section Component
interface ShareSectionProps {
  title?: string;
  className?: string;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ 
  title = "Share this article:", 
  className 
}) => (
  <div className={cn("border-t border-b py-6 my-8", className)}>
    <div className="flex flex-col sm:flex-row items-center justify-between">
      <p className="font-medium mb-4 sm:mb-0">{title}</p>
      <div className="flex space-x-4">
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook h-4 w-4">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter h-4 w-4">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin h-4 w-4">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 h-4 w-4">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
);

// Author Section Component
interface AuthorSectionProps {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  className?: string;
}

export const AuthorSection: React.FC<AuthorSectionProps> = ({ 
  name, 
  title, 
  bio, 
  imageUrl, 
  className 
}) => (
  <div className={cn("bg-muted/30 rounded-lg p-6 my-8", className)}>
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
        <Image 
          alt={name} 
          width={64} 
          height={64} 
          className="w-full h-full object-cover" 
          src={imageUrl}
        />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <p className="text-sm">{bio}</p>
      </div>
    </div>
  </div>
);

// CTA Section Component
interface CTASectionProps {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton: {
    text: string;
    href: string;
  };
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ 
  title, 
  description, 
  primaryButton, 
  secondaryButton, 
  className 
}) => (
  <div className={cn("bg-primary text-white p-8 rounded-lg my-12", className)}>
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="mb-6 text-white/90 max-w-2xl mx-auto">{description}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a 
          href={primaryButton.href}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 h-10 rounded-md px-6 has-[>svg]:px-4"
        >
          {primaryButton.text}
        </a>
        <a 
          href={secondaryButton.href}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 rounded-md px-6 has-[>svg]:px-4 bg-transparent border-white text-white hover:bg-white/10"
        >
          {secondaryButton.text}
        </a>
      </div>
    </div>
  </div>
);

// Related Posts Component for blog formatting
interface BlogRelatedPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

interface RelatedPostsProps {
  posts: BlogRelatedPost[];
  className?: string;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, className }) => (
  <div className={cn("my-12", className)}>
    <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <a
          key={post.id}
          href={`/blog/posts/${post.slug}`}
          className="group bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full"
        >
          <div className="h-40 overflow-hidden">
            <Image
              alt={post.title}
              loading="lazy"
              width={400}
              height={250}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={post.image}
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/400x250/02228F/ffffff?text=${encodeURIComponent(post.category.replace(/&/g, 'and'))}`;
              }}
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center text-xs text-muted-foreground mt-auto">
              <div className="flex items-center">
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
);