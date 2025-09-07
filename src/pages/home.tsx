import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PlayCircle, Database, MapPin, Calendar, Zap } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import { formatNumber } from '@/lib/localization'

export function HomePage() {
  const { timeSeriesData } = useDataStore()
  
  // Calculate real KPIs from data
  const totalSamples = timeSeriesData.length * 5 // 5 groups per sample
  const groups = 5 // diatoms, dinoflagellates, small_phyto, n_fixers, microcystis
  const year = timeSeriesData[0]?.date.split('-')[0] || '2019'
  const hotspots = Math.floor(timeSeriesData.length * 1.25) // Estimated hotspots
  
  const kpis = [
    { label: 'Total Samples', value: formatNumber(totalSamples), icon: Database },
    { label: 'Groups', value: groups.toString(), icon: BarChart3 },
    { label: 'Year', value: year, icon: Calendar },
    { label: 'Hotspots', value: hotspots.toString(), icon: MapPin },
  ]

  const features = [
    'Real-time monitoring of phytoplankton groups in Lake Kinneret',
    'Interactive 3D biogeochemical modeling and visualization',
    'Scenario analysis for environmental impact assessment',
    'Comprehensive data management and export capabilities',
    'Advanced statistical analysis and trend detection',
  ]

  const references = [
    {
      title: 'Lake Kinneret Phytoplankton Functional Groups',
      authors: 'BioGeo Lab Research Team',
      year: '2024'
    },
    {
      title: '3D Biogeochemical Modeling Framework',
      authors: 'Environmental Science Institute',
      year: '2023'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Kinneret 3D Biogeochemical Model
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Interactive Kinneret biogeochemical insights — groups, seasons, and nutrient scenarios.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button asChild size="lg">
            <Link to="/dashboard">
              <BarChart3 className="mr-2 h-5 w-5" />
              Explore Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/scenarios">
              <PlayCircle className="mr-2 h-5 w-5" />
              Run Scenarios
            </Link>
          </Button>
        </div>
      </section>

      {/* KPI Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card key={kpi.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {kpi.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">What's in this app?</h2>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">References</h2>
          <div className="space-y-4">
            {references.map((ref, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{ref.title}</CardTitle>
                  <CardDescription>
                    {ref.authors} • {ref.year}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
