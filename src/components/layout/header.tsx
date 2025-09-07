import React from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="responsive-container flex h-16 items-center justify-between">
        <div className="responsive-flex min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0 responsive-button"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="responsive-flex min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">🦠</span>
            <div className="min-w-0">
              <h1 className="responsive-heading font-bold text-primary responsive-text-truncate">Kinneret BioGeo Lab</h1>
              <p className="responsive-text text-muted-foreground hidden sm:block">3D Biogeochemical Model</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
