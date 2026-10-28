import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground"
        onClick={toggleTheme}
        title={mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="size-4 text-muted-foreground transition-transform hover:-rotate-12" />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-between gap-2 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Select theme"
        >
          <div className="flex items-center gap-2">
            {mounted && resolvedTheme === "dark" ? (
              <Moon className="size-3.5 text-amber-300" />
            ) : (
              <Sun className="size-3.5 text-amber-500" />
            )}
            <span className="capitalize">
              {mounted ? (theme === "system" ? `System (${resolvedTheme})` : theme) : "Theme"}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Theme
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={mounted && theme === "light" ? "font-semibold text-primary" : ""}
        >
          <Sun className="mr-2 size-4 text-amber-500" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={mounted && theme === "dark" ? "font-semibold text-primary" : ""}
        >
          <Moon className="mr-2 size-4 text-amber-300" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={mounted && theme === "system" ? "font-semibold text-primary" : ""}
        >
          <Laptop className="mr-2 size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
