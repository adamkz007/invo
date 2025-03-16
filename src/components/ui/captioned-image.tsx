import React from 'react';
import { cn } from '@/lib/utils';

interface CaptionedImageProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  fallbackText?: string;
}

export function CaptionedImage({
  src,
  alt,
  caption,
  className,
  fallbackText
}: CaptionedImageProps) {
  return (
    <figure className={cn("my-8 overflow-hidden rounded-md", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto"
        onError={(e) => {
          if (fallbackText) {
            e.currentTarget.src = `https://placehold.co/800x500/02228F/ffffff?text=${encodeURIComponent(fallbackText)}`;
          }
        }}
      />
      <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
        {caption}
      </figcaption>
    </figure>
  );
} 