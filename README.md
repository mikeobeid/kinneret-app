# Kinneret 3D Biogeochemical Model

A comprehensive React application for analyzing phytoplankton dynamics in Lake Kinneret, Israel's largest freshwater lake. This app provides interactive tools for scientific research, data visualization, and environmental modeling.

## 🌊 About

The Kinneret3D Dynamics is dedicated to understanding the complex interactions between phytoplankton communities and biogeochemical processes in Lake Kinneret. Our research focuses on developing advanced 3D models to predict and manage the lake's ecological health.

## ✨ Features

### 📊 **Interactive Data Visualization**
- **Statistics Page**: Temporal trends, monthly patterns, and yearly distributions
- **Research Dashboard**: 3D biogeochemical modeling with depth-time analysis
- **Dashboard**: Data integration with PCA analysis and statistical metrics
- **Scenarios Page**: Predictive modeling and sensitivity analysis
- **Live Data Page**: Real-time monitoring with spatial distribution maps

### 🎯 **Scientific Export System**
- **Publication-ready figures**: PNG and SVG export with high resolution
- **Multiple themes**: Light, Dark, and Transparent backgrounds
- **Scientific metadata**: Captions, units, sources, and timestamps
- **Batch export**: Individual figure export controls
- **Professional formatting**: Consistent typography and styling

### 🔬 **Research Capabilities**
- **5 Phytoplankton Groups**: Diatoms, Dinoflagellates, Small Phytoplankton, N-fixers, Microcystis
- **3D Spatial Modeling**: Captures coastal vs central patterns
- **Seasonal Analysis**: Spring blooms, summer patterns, winter dynamics
- **Parameter Sensitivity**: Growth rates, nutrient uptake, half-saturation constants
- **Scenario Testing**: Environmental change simulations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mikeobeid/kinneret-app.git
cd kinneret-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── figure-frame.tsx # Figure wrapper with export controls
│   ├── figure-export-controls.tsx # Export functionality
│   └── ui/             # Shadcn/ui components
├── lib/
│   └── figure/         # Export engine and utilities
├── pages/              # Main application pages
│   ├── statistics.tsx  # Statistical analysis
│   ├── research-dashboard.tsx # 3D modeling
│   ├── dashboard.tsx   # Data overview
│   ├── scenarios.tsx   # Predictive modeling
│   └── live-data.tsx   # Real-time monitoring
├── data/               # Sample datasets
└── store/              # State management
```

## 🔬 Scientific Background

### Research Findings
- **3D Biogeochemical Model Development**: Successfully developed and calibrated a 3D physical-biogeochemical model using the DARWIN framework
- **Seasonal Bloom Patterns**: Model reproduces observed spring Microcystis blooms and summer N-fixing cyanobacteria blooms
- **Spatial Distribution Insights**: 3D model reveals important spatial patterns that 1D models cannot capture

### What We Model
- **Phytoplankton Groups**: 5 functional groups with realistic physiological parameters
- **Environmental Factors**: Nutrient concentrations (P, N, Fe, Si), temperature, light, water column mixing
- **Spatial Variability**: High coastal concentrations in summer, central concentrations in winter

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: Shadcn/ui, Radix UI, Tailwind CSS
- **Data Visualization**: Recharts, Leaflet (maps)
- **State Management**: Zustand
- **Export System**: html2canvas, JSZip
- **Routing**: React Router DOM

## 📊 Export System

The app includes a comprehensive figure export system:

- **Formats**: PNG (2x scale) and SVG (vector)
- **Themes**: Light, Dark, Transparent
- **Metadata**: Scientific captions, units, sources
- **Quality**: Publication-ready resolution
- **Filename Pattern**: `kinneret-<page>-<figure-key>-<style>.<ext>`

## 🤝 Contributing

This is a research application. For scientific collaboration or technical contributions, please contact the research team.

## 📄 License

This project is part of ongoing research at the Kinneret3D Dynamics. Please cite appropriately if used in research.

## 🙏 Acknowledgments

- **Research Team**: Dr. Yael Amitai (Water Authority), MIT Darwin Model Development Team
- **Institutions**: Water Authority of Israel, MIT, Kinneret Limnological Laboratory
- **Funding**: Israel Science Foundation, Ministry of Environmental Protection

## 📞 Contact

For research inquiries or technical support, please contact the Kinneret3D Dynamics research team.

---

*Last updated: December 2024 | Version 1.0.0*