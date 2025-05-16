import { LayoutGrid } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary/10 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">DayFlow</h1>
        </div>
        {/* Future additions: User profile, settings */}
      </div>
    </header>
  );
}
