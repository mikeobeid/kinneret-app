const fs = require('fs')
const path = require('path')

// Create a simple temperature raster data generator
function generateTemperatureRaster(season, width = 256, height = 256) {
  const data = []
  
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      // Create temperature pattern
      const centerX = width / 2
      const centerY = height / 2
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)
      const normalizedDist = distFromCenter / maxDist
      
      let temp
      if (season === 'winter') {
        // Winter: cooler in center, warmer near edges
        temp = 20 - normalizedDist * 10 // 10-20°C range
      } else {
        // Summer: warmer in center, cooler near edges
        temp = 20 + normalizedDist * 10 // 20-30°C range
      }
      
      // Add some noise
      temp += (Math.random() - 0.5) * 2
      
      row.push(Math.max(0, Math.min(255, Math.round(temp * 8.5)))) // Scale to 0-255
    }
    data.push(row)
  }
  
  return data
}

// Generate winter raster
const winterData = generateTemperatureRaster('winter')
const summerData = generateTemperatureRaster('summer')

// Create simple PPM files (can be converted to PNG later)
function createPPM(data, filename) {
  const width = data[0].length
  const height = data.length
  
  let ppm = `P3\n${width} ${height}\n255\n`
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = data[y][x]
      // Use turbo colormap approximation
      const r = Math.min(255, Math.max(0, value))
      const g = Math.min(255, Math.max(0, value * 0.8))
      const b = Math.min(255, Math.max(0, value * 0.6))
      ppm += `${r} ${g} ${b} `
    }
    ppm += '\n'
  }
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'rasters', filename), ppm)
}

// Create placeholder files
createPPM(winterData, 'temp_winter.ppm')
createPPM(summerData, 'temp_summer.ppm')

console.log('Temperature raster files generated!')
console.log('Note: These are PPM files. For production, convert to PNG format.')
