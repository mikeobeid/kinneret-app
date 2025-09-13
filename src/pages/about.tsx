import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const glossary = [
  {
    term: 'Phytoplankton',
    definition: 'Microscopic algae that form the base of the aquatic food web and are primary producers in Lake Kinneret.'
  },
  {
    term: 'Zooplankton (future)',
    definition: 'Microscopic animals that feed on phytoplankton, playing a crucial role in the aquatic food web.'
  },
  {
    term: 'Half-saturation (Ks)',
    definition: 'The nutrient concentration at which growth rate is half the maximum rate, indicating nutrient affinity.'
  },
  {
    term: 'Maximum growth (μ)',
    definition: 'The highest possible growth rate of phytoplankton under optimal environmental conditions.'
  },
  {
    term: 'N:P ratio',
    definition: 'The ratio of nitrogen to phosphorus concentrations, indicating nutrient limitation patterns.'
  },
  {
    term: 'Resource limitation (min law)',
    definition: 'The principle that growth is limited by the resource in shortest supply relative to demand.'
  }
]

const researchFindings = [
  {
    title: '3D Biogeochemical Model Development',
    description: 'Successfully developed and calibrated a 3D physical-biogeochemical model for Lake Kinneret using the DARWIN framework.',
    keyPoints: [
      'Simulates biogeochemical cycles of C, P, N, Si, Fe, and O₂',
      'Models 5 functional phytoplankton groups with realistic parameters',
      'Captures spatial variability in bloom patterns',
      'Validated against monitoring data from Station A'
    ]
  },
  {
    title: 'Seasonal Bloom Patterns',
    description: 'Model successfully reproduces observed seasonal patterns of phytoplankton blooms.',
    keyPoints: [
      'Spring Microcystis bloom (March-May)',
      'Summer N-fixing cyanobacteria bloom (July-September)',
      'Winter central concentration patterns',
      'Summer coastal concentration due to westerly winds'
    ]
  },
  {
    title: 'Spatial Distribution Insights',
    description: '3D model reveals important spatial patterns that 1D models cannot capture.',
    keyPoints: [
      'High biomass in lake center during winter',
      'Coastal accumulation during summer due to wind-driven currents',
      'Heterogeneous distribution across the lake',
      'Agreement with satellite observations'
    ]
  }
]

const credits = [
  {
    category: 'Research Team',
    items: [
      'Dr. Yael Amitai - Lead Researcher (Water Authority)',
      'MIT Darwin Model Development Team',
      'Kinneret Monitoring Program Staff',
      '3D Ecological Modeling Specialists'
    ]
  },
  {
    category: 'Institutions',
    items: [
      'Water Authority of Israel (רשות המים)',
      'MIT - Darwin Model Framework',
      'Kinneret Limnological Laboratory',
      'Israel Oceanographic and Limnological Research'
    ]
  },
  {
    category: 'Funding',
    items: [
      'Israel Science Foundation (ISF)',
      'Ministry of Environmental Protection',
      'Water Authority of Israel',
      'European Union Horizon 2020'
    ]
  },
  {
    category: 'Technology',
    items: [
      'React & TypeScript - Frontend Framework',
      'Recharts - Data Visualization',
      'Leaflet - Interactive Mapping',
      'Zustand - State Management'
    ]
  }
]

export function AboutPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Learn about the Kinneret3D Dynamics and our research mission
        </p>
      </div>

      {/* Purpose Section */}
      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Kinneret3D Dynamics is dedicated to understanding the complex interactions between 
            phytoplankton communities and biogeochemical processes in Lake Kinneret, Israel's largest 
            freshwater lake. Our research focuses on developing advanced 3D models to predict and 
            manage the lake's ecological health.
          </p>
          <p className="text-muted-foreground">
            This application provides researchers, environmental managers, and the public with 
            interactive tools to explore phytoplankton dynamics, run scenario analyses, and 
            visualize the intricate relationships that govern Lake Kinneret's ecosystem.
          </p>
        </CardContent>
      </Card>

      {/* Research Findings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Research Findings</CardTitle>
          <CardDescription>
            Key discoveries from our 3D biogeochemical modeling research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {researchFindings.map((finding, index) => (
            <div key={index} className="space-y-3">
              <h4 className="font-semibold text-lg">{finding.title}</h4>
              <p className="text-muted-foreground">{finding.description}</p>
              <ul className="space-y-1 text-sm">
                {finding.keyPoints.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {index < researchFindings.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What's Modeled Section */}
      <Card>
        <CardHeader>
          <CardTitle>What We Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Phytoplankton Groups</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Diatoms - Silica-dependent primary producers</li>
                <li>• Dinoflagellates - Flagellated mixotrophs</li>
                <li>• Small Phytoplankton - Picoplankton community</li>
                <li>• N-fixers - Nitrogen-fixing cyanobacteria</li>
                <li>• Microcystis - Potentially harmful cyanobacteria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Environmental Factors</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Nutrient concentrations (P, N, Fe, Si)</li>
                <li>• Temperature and light conditions</li>
                <li>• Water column mixing and stratification</li>
                <li>• Seasonal and interannual variability</li>
                <li>• Spatial distribution patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glossary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Glossary</CardTitle>
          <CardDescription>
            Key terms and concepts used in our research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {glossary.map((item, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-primary">{item.term}</h4>
                <p className="text-sm text-muted-foreground">{item.definition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Credits & Acknowledgments</CardTitle>
          <CardDescription>
            The people and organizations that make this research possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {credits.map((section, index) => (
              <div key={index}>
                <h4 className="font-medium mb-3">{section.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {section.items.map((item, itemIndex) => (
                    <Badge key={itemIndex} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
                {index < credits.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Research Inquiries</h4>
              <p className="text-sm text-muted-foreground">
                For scientific questions or collaboration opportunities, 
                please contact our research team.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Technical Support</h4>
              <p className="text-sm text-muted-foreground">
                For technical issues with this application, 
                please report bugs or request features.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: December 2024 | Version 1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}