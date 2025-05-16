
"use client";

import { LayoutGrid, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null until mounted to avoid hydration mismatch
    return (
      <header className="bg-primary/10 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">DayFlow</h1>
          </div>
          <div className="h-10 w-10"></div> {/* Placeholder for button dimensions */}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary/10 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">DayFlow</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-6 w-6 text-foreground" />
          ) : (
            <Moon className="h-6 w-6 text-foreground" />
          )}
        </Button>
      </div>
    </header>
  );
}
