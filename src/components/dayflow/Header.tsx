
"use client";

import { LayoutGrid, Moon, Sun, Palette, Gem, Crown, Tv, Heart } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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

  let TriggerIcon = Palette;
  if (resolvedTheme === 'light') TriggerIcon = Sun;
  else if (resolvedTheme === 'dark') TriggerIcon = Moon;
  else if (resolvedTheme === 'premium') TriggerIcon = Gem;
  else if (resolvedTheme === 'royal') TriggerIcon = Crown;
  else if (resolvedTheme === 'soft') TriggerIcon = Heart;


  return (
    <header className="bg-primary/10 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">DayFlow</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Change theme">
              <TriggerIcon className="h-6 w-6 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('premium')}>
              <Gem className="mr-2 h-4 w-4" />
              <span>Premium</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('royal')}>
              <Crown className="mr-2 h-4 w-4" />
              <span>Royal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('soft')}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Soft</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Tv className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
