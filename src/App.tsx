import { useState } from 'react'
import './App.css'

interface ColorStop {
  id: string
  color: string
  offset: number
}

type GradientType = 'linear' | 'radial'

interface NoiseSettings {
  enabled: boolean
  baseFrequency: number
  numOctaves: number
  scale: number
}

function App() {
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', offset: 0 },
    { id: '2', color: '#764ba2', offset: 100 }
  ])
  const [noise, setNoise] = useState<NoiseSettings>({
    enabled: false,
    baseFrequency: 0.02,
    numOctaves: 3,
    scale: 20
  })
  const [copied, setCopied] = useState(false)

  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      offset: 50
    }
    setColorStops([...colorStops, newStop].sort((a, b) => a.offset - b.offset))
  }

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter(stop => stop.id !== id))
    }
  }

  const updateColorStop = (id: string, field: 'color' | 'offset', value: string | number) => {
    setColorStops(colorStops.map(stop =>
      stop.id === id ? { ...stop, [field]: value } : stop
    ).sort((a, b) => a.offset - b.offset))
  }

  const generateSVG = () => {
    const gradientId = 'gradient-' + Date.now()
    const filterId = 'filter-' + Date.now()
    const turbulenceId = 'turbulence-' + Date.now()
    const patternId = 'pattern-' + Date.now()

    const stops = colorStops.map(stop =>
      `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`
    ).join('\n      ')

    if (noise.enabled) {
      // Apply displacement to the gradient pattern itself
      if (gradientType === 'linear') {
        const rad = (angle - 90) * Math.PI / 180
        const x1 = 50 + 50 * Math.cos(rad)
        const y1 = 50 + 50 * Math.sin(rad)
        const x2 = 50 - 50 * Math.cos(rad)
        const y2 = 50 - 50 * Math.sin(rad)

        return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${stops}
    </linearGradient>
    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="${noise.baseFrequency}"
        numOctaves="${noise.numOctaves}"
        result="turbulence" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="turbulence"
        scale="${noise.scale}"
        xChannelSelector="R"
        yChannelSelector="G" />
    </filter>
    <pattern id="${patternId}" width="100%" height="100%" patternUnits="objectBoundingBox">
      <rect width="100%" height="100%" fill="url(#${gradientId})" filter="url(#${filterId})" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#${patternId})" />
</svg>`
      } else {
        return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      ${stops}
    </radialGradient>
    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="${noise.baseFrequency}"
        numOctaves="${noise.numOctaves}"
        result="turbulence" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="turbulence"
        scale="${noise.scale}"
        xChannelSelector="R"
        yChannelSelector="G" />
    </filter>
    <pattern id="${patternId}" width="100%" height="100%" patternUnits="objectBoundingBox">
      <rect width="100%" height="100%" fill="url(#${gradientId})" filter="url(#${filterId})" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#${patternId})" />
</svg>`
      }
    } else {
      // No displacement, use gradient directly
      if (gradientType === 'linear') {
        const rad = (angle - 90) * Math.PI / 180
        const x1 = 50 + 50 * Math.cos(rad)
        const y1 = 50 + 50 * Math.sin(rad)
        const x2 = 50 - 50 * Math.cos(rad)
        const y2 = 50 - 50 * Math.sin(rad)

        return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${stops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${gradientId})" />
</svg>`
      } else {
        return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      ${stops}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${gradientId})" />
</svg>`
      }
    }
  }

  const copySVG = async () => {
    try {
      await navigator.clipboard.writeText(generateSVG())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadSVG = () => {
    const svg = generateSVG()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gradient-background.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const svgCode = generateSVG()

  return (
    <div className="app">
      <header>
        <h1>SVG Gradient Generator</h1>
        <p>Create beautiful gradient backgrounds for your projects</p>
      </header>

      <div className="container">
        <div className="preview-section">
          <h2>Preview</h2>
          <div className="preview" dangerouslySetInnerHTML={{ __html: svgCode }} />
        </div>

        <div className="controls-section">
          <h2>Controls</h2>

          <div className="control-group">
            <label>Gradient Type</label>
            <div className="button-group">
              <button
                className={gradientType === 'linear' ? 'active' : ''}
                onClick={() => setGradientType('linear')}
              >
                Linear
              </button>
              <button
                className={gradientType === 'radial' ? 'active' : ''}
                onClick={() => setGradientType('radial')}
              >
                Radial
              </button>
            </div>
          </div>

          {gradientType === 'linear' && (
            <div className="control-group">
              <label>Angle: {angle}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
              />
            </div>
          )}

          <div className="control-group">
            <div className="color-stops-header">
              <label>Distortion Effects</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={noise.enabled}
                  onChange={(e) => setNoise({ ...noise, enabled: e.target.checked })}
                />
                Enable
              </label>
            </div>

            {noise.enabled && (
              <div className="noise-controls">
                <div className="control-row">
                  <label>Base Frequency: {noise.baseFrequency.toFixed(3)}</label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={noise.baseFrequency}
                    onChange={(e) => setNoise({ ...noise, baseFrequency: Number(e.target.value) })}
                  />
                </div>

                <div className="control-row">
                  <label>Octaves: {noise.numOctaves}</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={noise.numOctaves}
                    onChange={(e) => setNoise({ ...noise, numOctaves: Number(e.target.value) })}
                  />
                </div>

                <div className="control-row">
                  <label>Displacement Scale: {noise.scale}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={noise.scale}
                    onChange={(e) => setNoise({ ...noise, scale: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="color-stops-header">
              <label>Color Stops</label>
              <button onClick={addColorStop} className="add-button">+ Add Stop</button>
            </div>

            <div className="color-stops">
              {colorStops.map((stop) => (
                <div key={stop.id} className="color-stop">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.offset}
                    onChange={(e) => updateColorStop(stop.id, 'offset', Number(e.target.value))}
                  />
                  <span>%</span>
                  {colorStops.length > 2 && (
                    <button
                      onClick={() => removeColorStop(stop.id)}
                      className="remove-button"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button onClick={copySVG} className="action-button primary">
              {copied ? 'Copied!' : 'Copy SVG Code'}
            </button>
            <button onClick={downloadSVG} className="action-button">
              Download SVG
            </button>
          </div>
        </div>
      </div>

      <div className="code-section">
        <h2>SVG Code</h2>
        <pre><code>{svgCode}</code></pre>
      </div>
    </div>
  )
}

export default App
