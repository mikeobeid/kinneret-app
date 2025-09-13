import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/theme-context'
import { MainLayout } from '@/components/layout/main-layout'
import { SimpleHomePage } from '@/pages/simple-home'
import { DashboardPage } from '@/pages/dashboard'
import { LiveDataPage } from '@/pages/live-data'
import { ResearchDashboardPage } from '@/pages/research-dashboard'
import { StatisticsPage } from '@/pages/statistics'
import { ScenariosPage } from '@/pages/scenarios'
import { DataPage } from '@/pages/data'
import { AboutPage } from '@/pages/about'


function App() {
  return (
    <ThemeProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<SimpleHomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/live-data" element={<LiveDataPage />} />
            <Route path="/research" element={<ResearchDashboardPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  )
}

export default App
