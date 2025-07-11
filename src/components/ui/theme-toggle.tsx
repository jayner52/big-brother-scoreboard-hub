import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <Sun className="h-4 w-4" />
      <Switch 
        checked={isDark} 
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
};