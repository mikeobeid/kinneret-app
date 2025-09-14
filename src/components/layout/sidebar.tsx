import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  Activity,
  BarChart3,
  TrendingUp,
  PlayCircle,
  Database,
  Info,
  Microscope
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col space-y-1 p-4">
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
                      : 'text-muted-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}
