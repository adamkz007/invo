'use client';

import Image from 'next/image';

// Default author information
export const DEFAULT_AUTHOR = {
  name: 'Adam',
  role: 'Founder',
  bio: 'Adam consults for both large organizations and SMEs to identify & optimize finance processes. Growing tired of clunky invoice tools available in the market, he sets out to build Invo.',
  image: '/blog/authors/adam.jpg'
};

interface AuthorBioProps {
  author?: {
    name?: string;
    role?: string;
    bio?: string;
    image?: string;
  };
}

export function AuthorBio({ author = DEFAULT_AUTHOR }: AuthorBioProps) {
  // Merge with default author properties
  const authorInfo = {
    ...DEFAULT_AUTHOR,
    ...author
  };
  
  return (
    <div className="bg-muted/30 rounded-lg p-6 my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
          <Image
            src={authorInfo.image}
            alt={authorInfo.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/200x200/02228F/ffffff?text=${authorInfo.name.charAt(0)}`;
            }}
          />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-lg">{authorInfo.name}</h3>
          {authorInfo.role && <p className="text-sm text-muted-foreground mb-2">{authorInfo.role}</p>}
          <p className="text-sm">
            {authorInfo.bio}
          </p>
        </div>
      </div>
    </div>
  );
} 