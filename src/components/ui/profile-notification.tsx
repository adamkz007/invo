'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProfileNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        setIsLoading(true);
        // Fetch company details to check if profile is updated
        const response = await fetch('/api/company');
        
        if (response.ok) {
          const data = await response.json();
          
          // If data is null or legalName is empty, profile needs to be updated
          setIsVisible(!data || !data.legalName);
        } else {
          // If there's an error fetching company details, assume profile needs updating
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
    
    // Check profile status again if the user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkProfileStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-lg z-50 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Complete your business profile to get the most out of Invo</p>
          <p className="text-sm opacity-90">Add your company details to customize your invoices</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="secondary" size="sm">
              Update Profile
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 