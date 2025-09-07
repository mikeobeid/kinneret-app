/**
 * Figure Export Engine
 * 
 * Provides standardized export functionality for charts and maps
 * Supports SVG and PNG export with various styling options
 */

export interface ExportOptions {
  format: 'png' | 'svg'
  scale?: number
  bg: 'light' | 'dark' | 'transparent'
  filename: string
  includeCaption?: boolean
  includeMetadata?: boolean
}

export interface FigureMetadata {
  title: string
  subtitle?: string
  caption?: string
  units?: string
  source?: string
  timestamp?: string
  appName?: string
  appVersion?: string
}

export interface FigureSize {
  width: number
  height: number
}

export const FIGURE_SIZES = {
  small: { width: 1200, height: 800 },
  medium: { width: 1600, height: 1000 },
  large: { width: 2000, height: 1200 }
} as const

export type ThemeStyle = {
  background: string
  text: string
  gridlines: string
  title: string
  caption: string
}

export const THEME_STYLES: Record<'light' | 'dark' | 'transparent', ThemeStyle> = {
  light: {
    background: '#FFFFFF',
    text: '#111827',
    gridlines: '#E5E7EB',
    title: '#111827',
    caption: '#6B7280'
  },
  dark: {
    background: '#0B1220',
    text: '#E5E7EB',
    gridlines: '#334155',
    title: '#E5E7EB',
    caption: '#9CA3AF'
  },
  transparent: {
    background: 'transparent',
    text: '#374151',
    gridlines: '#6B7280',
    title: '#111827',
    caption: '#6B7280'
  }
}

/**
 * Sanitizes a filename by converting to kebab-case and removing invalid characters
 */
export function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Exports a DOM node as SVG
 */
export async function exportNodeAsSVG(
  element: HTMLElement,
  options: ExportOptions,
  metadata?: FigureMetadata
): Promise<Blob> {
  const { format, bg, includeCaption = true, includeMetadata = true } = options
  
  if (format !== 'svg') {
    throw new Error('exportNodeAsSVG only supports SVG format')
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement
  
  // Apply theme styling
  const theme = THEME_STYLES[bg]
  applyThemeToElement(clonedElement, theme)
  
  // Find SVG elements within the cloned element
  const svgElements = clonedElement.querySelectorAll('svg')
  
  if (svgElements.length === 0) {
    throw new Error('No SVG elements found in the provided element')
  }

  // Process each SVG element
  const processedSvgs = Array.from(svgElements).map(svg => {
    const processedSvg = svg.cloneNode(true) as SVGElement
    
    // Inline computed styles
    inlineComputedStyles(processedSvg)
    
    // Apply theme to SVG
    applyThemeToSVG(processedSvg, theme)
    
    return processedSvg
  })

  // Create a wrapper SVG that contains all processed SVGs
  const wrapperSvg = createWrapperSVG(processedSvgs, theme, metadata, {
    includeCaption,
    includeMetadata
  })

  // Serialize to SVG string
  const svgString = new XMLSerializer().serializeToString(wrapperSvg)
  
  // Create blob
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  
  return blob
}

/**
 * Exports a DOM node as PNG
 */
export async function exportNodeAsPNG(
  element: HTMLElement,
  options: ExportOptions,
  metadata?: FigureMetadata
): Promise<Blob> {
  const { format, scale = 2, bg, includeCaption = true, includeMetadata = true } = options
  
  if (format !== 'png') {
    throw new Error('exportNodeAsPNG only supports PNG format')
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement
  
  // Apply theme styling
  const theme = THEME_STYLES[bg]
  applyThemeToElement(clonedElement, theme)
  
  // Create a container for the export
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  container.style.width = `${element.offsetWidth}px`
  container.style.height = `${element.offsetHeight}px`
  container.style.backgroundColor = theme.background
  
  // Add caption and metadata if requested
  if (includeCaption || includeMetadata) {
    const metadataElement = createMetadataElement(metadata, theme, {
      includeCaption,
      includeMetadata
    })
    container.appendChild(metadataElement)
  }
  
  container.appendChild(clonedElement)
  document.body.appendChild(container)
  
  try {
    // Use html2canvas for rendering
    const { default: html2canvas } = await import('html2canvas')
    
    const canvas = await html2canvas(container, {
      scale: scale,
      backgroundColor: bg === 'transparent' ? null : theme.background,
      useCORS: true,
      allowTaint: true,
      width: element.offsetWidth,
      height: element.offsetHeight
    })
    
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          throw new Error('Failed to create PNG blob')
        }
      }, 'image/png')
    })
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * Applies theme styling to an element
 */
function applyThemeToElement(element: HTMLElement, theme: ThemeStyle): void {
  element.style.backgroundColor = theme.background
  element.style.color = theme.text
  
  // Apply to all child elements
  const allElements = element.querySelectorAll('*')
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement
    if (htmlEl.style) {
      // Update text colors
      if (htmlEl.tagName === 'TEXT' || htmlEl.classList.contains('text-muted-foreground')) {
        htmlEl.style.fill = theme.caption
        htmlEl.style.color = theme.caption
      } else if (htmlEl.classList.contains('text-foreground') || !htmlEl.style.color) {
        htmlEl.style.color = theme.text
        htmlEl.style.fill = theme.text
      }
      
      // Update gridlines
      if (htmlEl.classList.contains('recharts-cartesian-grid-horizontal') || 
          htmlEl.classList.contains('recharts-cartesian-grid-vertical')) {
        htmlEl.style.stroke = theme.gridlines
      }
    }
  })
}

/**
 * Applies theme styling to an SVG element
 */
function applyThemeToSVG(svg: SVGElement, theme: ThemeStyle): void {
  svg.style.backgroundColor = theme.background
  
  // Update all text elements
  const textElements = svg.querySelectorAll('text, tspan')
  textElements.forEach(textEl => {
    const text = textEl as SVGTextElement
    if (text.style.fill === 'currentColor' || !text.style.fill) {
      text.style.fill = theme.text
    }
  })
  
  // Update grid lines
  const gridLines = svg.querySelectorAll('.recharts-cartesian-grid-horizontal, .recharts-cartesian-grid-vertical')
  gridLines.forEach(line => {
    const lineEl = line as SVGLineElement
    lineEl.style.stroke = theme.gridlines
  })
}

/**
 * Inlines computed styles into SVG elements
 */
function inlineComputedStyles(svg: SVGElement): void {
  const allElements = svg.querySelectorAll('*')
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement
    if (htmlEl.style) {
      const computedStyle = window.getComputedStyle(htmlEl)
      
      // Copy important style properties
      const importantProps = [
        'fill', 'stroke', 'strokeWidth', 'fontFamily', 'fontSize', 
        'fontWeight', 'textAnchor', 'dominantBaseline', 'opacity'
      ]
      
      importantProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop)
        if (value && value !== 'initial' && value !== 'inherit') {
          htmlEl.style.setProperty(prop, value)
        }
      })
    }
  })
}

/**
 * Creates a wrapper SVG containing all processed SVGs
 */
function createWrapperSVG(
  svgElements: SVGElement[],
  theme: ThemeStyle,
  metadata?: FigureMetadata,
  options: { includeCaption: boolean; includeMetadata: boolean } = { includeCaption: true, includeMetadata: true }
): SVGElement {
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  wrapper.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  wrapper.setAttribute('width', '1600')
  wrapper.setAttribute('height', '1000')
  wrapper.setAttribute('viewBox', '0 0 1600 1000')
  
  // Set background
  if (theme.background !== 'transparent') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', theme.background)
    wrapper.appendChild(rect)
  }
  
  // Add title
  if (metadata?.title) {
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    title.setAttribute('x', '50')
    title.setAttribute('y', '40')
    title.setAttribute('font-family', 'Inter, system-ui, sans-serif')
    title.setAttribute('font-size', '24')
    title.setAttribute('font-weight', '600')
    title.setAttribute('fill', theme.title)
    title.textContent = metadata.title
    wrapper.appendChild(title)
  }
  
  // Add subtitle
  if (metadata?.subtitle) {
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    subtitle.setAttribute('x', '50')
    subtitle.setAttribute('y', '70')
    subtitle.setAttribute('font-family', 'Inter, system-ui, sans-serif')
    subtitle.setAttribute('font-size', '16')
    subtitle.setAttribute('fill', theme.caption)
    subtitle.textContent = metadata.subtitle
    wrapper.appendChild(subtitle)
  }
  
  // Add main content area
  const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  contentGroup.setAttribute('transform', 'translate(50, 100)')
  
  // Add each SVG element
  svgElements.forEach((svg, index) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('transform', `translate(0, ${index * 400})`)
    
    // Clone and scale the SVG
    const clonedSvg = svg.cloneNode(true) as SVGElement
    clonedSvg.setAttribute('width', '1500')
    clonedSvg.setAttribute('height', '350')
    clonedSvg.setAttribute('viewBox', '0 0 1500 350')
    
    group.appendChild(clonedSvg)
    contentGroup.appendChild(group)
  })
  
  wrapper.appendChild(contentGroup)
  
  // Add caption
  if (options.includeCaption && metadata?.caption) {
    const caption = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    caption.setAttribute('x', '50')
    caption.setAttribute('y', '950')
    caption.setAttribute('font-family', 'Inter, system-ui, sans-serif')
    caption.setAttribute('font-size', '14')
    caption.setAttribute('fill', theme.caption)
    caption.textContent = metadata.caption
    wrapper.appendChild(caption)
  }
  
  // Add metadata footer
  if (options.includeMetadata) {
    const metadataText = createMetadataText(metadata, theme)
    if (metadataText) {
      wrapper.appendChild(metadataText)
    }
  }
  
  return wrapper
}

/**
 * Creates metadata text element for SVG
 */
function createMetadataText(metadata?: FigureMetadata, theme?: ThemeStyle): SVGElement | null {
  if (!metadata) return null
  
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  
  let y = 980
  const fontSize = '12'
  const fontFamily = 'Inter, system-ui, sans-serif'
  
  // Add units
  if (metadata.units) {
    const units = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    units.setAttribute('x', '50')
    units.setAttribute('y', y.toString())
    units.setAttribute('font-family', fontFamily)
    units.setAttribute('font-size', fontSize)
    units.setAttribute('fill', theme?.caption || '#6B7280')
    units.textContent = `Units: ${metadata.units}`
    group.appendChild(units)
    y -= 20
  }
  
  // Add source
  if (metadata.source) {
    const source = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    source.setAttribute('x', '50')
    source.setAttribute('y', y.toString())
    source.setAttribute('font-family', fontFamily)
    source.setAttribute('font-size', fontSize)
    source.setAttribute('fill', theme?.caption || '#6B7280')
    source.textContent = `Source: ${metadata.source}`
    group.appendChild(source)
    y -= 20
  }
  
  // Add app info and timestamp
  const appInfo = `${metadata.appName || 'Kinneret BioGeo Lab'} v${metadata.appVersion || '1.0.0'} | ${metadata.timestamp || new Date().toISOString()}`
  const app = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  app.setAttribute('x', '50')
  app.setAttribute('y', y.toString())
  app.setAttribute('font-family', fontFamily)
  app.setAttribute('font-size', fontSize)
  app.setAttribute('fill', theme?.caption || '#6B7280')
  app.textContent = appInfo
  group.appendChild(app)
  
  return group
}

/**
 * Creates metadata element for PNG export
 */
function createMetadataElement(
  metadata?: FigureMetadata,
  theme?: ThemeStyle,
  options: { includeCaption: boolean; includeMetadata: boolean } = { includeCaption: true, includeMetadata: true }
): HTMLElement {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.backgroundColor = theme?.background || '#FFFFFF'
  container.style.color = theme?.text || '#111827'
  container.style.fontFamily = 'Inter, system-ui, sans-serif'
  
  if (options.includeCaption && metadata?.caption) {
    const caption = document.createElement('div')
    caption.style.fontSize = '14px'
    caption.style.color = theme?.caption || '#6B7280'
    caption.style.marginBottom = '10px'
    caption.textContent = metadata.caption
    container.appendChild(caption)
  }
  
  if (options.includeMetadata) {
    const metadataDiv = document.createElement('div')
    metadataDiv.style.fontSize = '12px'
    metadataDiv.style.color = theme?.caption || '#6B7280'
    
    const parts = []
    if (metadata?.units) parts.push(`Units: ${metadata.units}`)
    if (metadata?.source) parts.push(`Source: ${metadata.source}`)
    if (metadata?.appName) parts.push(`${metadata.appName} v${metadata.appVersion || '1.0.0'}`)
    if (metadata?.timestamp) parts.push(metadata.timestamp)
    
    metadataDiv.textContent = parts.join(' | ')
    container.appendChild(metadataDiv)
  }
  
  return container
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Creates a ZIP file containing multiple exported figures
 */
export async function createFiguresZip(
  figures: Array<{ blob: Blob; filename: string }>
): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  
  const zip = new JSZip()
  
  figures.forEach(({ blob, filename }) => {
    zip.file(filename, blob)
  })
  
  return await zip.generateAsync({ type: 'blob' })
}
