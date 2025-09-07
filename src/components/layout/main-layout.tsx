import React, { useState, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { DemoBanner } from '@/components/demo-banner'

interface MainLayoutProps {
  children?: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="ml-0 md:ml-64 transition-all duration-200">
        <div className="container mx-auto p-3 sm:p-4 min-h-[calc(100vh-4rem)]">
          <DemoBanner />
          <div className="mt-4">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  )
}
