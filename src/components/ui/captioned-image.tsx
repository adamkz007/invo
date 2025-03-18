import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CaptionedImageProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  fallbackText?: string;
}

export const CaptionedImage: React.FC<CaptionedImageProps> = ({
  src,
  alt,
  caption,
  className = '',
  fallbackText
}) => {
  const [hasError, setHasError] = useState(false);
  
  return (
    <figure className={`my-6 ${className}`}>
      <div className="overflow-hidden rounded-md bg-muted">
        {hasError ? (
          <div className="flex items-center justify-center bg-muted text-muted-foreground h-64 w-full">
            {fallbackText || alt}
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={675}
            className="w-full h-auto"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
        {caption}
      </figcaption>
    </figure>
  );
}; 