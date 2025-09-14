import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  Activity,
  BarChart3,
  TrendingUp,
  PlayCircle,
  Database,
  Info,
  Microscope,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Live Data', href: '/live-data', icon: Activity },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Research', href: '/research', icon: Microscope },
  { name: 'Statistics', href: '/statistics', icon: TrendingUp },
  { name: 'Scenarios', href: '/scenarios', icon: PlayCircle },
  { name: 'Data', href: '/data', icon: Database },
  { name: 'About', href: '/about', icon: Info },
]

export function Sidebar({ isOpen, onClose, onToggleSidebar, sidebarCollapsed }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-200 ease-in-out md:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col space-y-1 p-4">
          {/* Toggle Button */}
          {onToggleSidebar && (
            <div className="mb-4 pb-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="w-full justify-center"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          {/* Navigation Items */}
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                    sidebarCollapsed && 'justify-center'
                  )
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}
