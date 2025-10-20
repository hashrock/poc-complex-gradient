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

  const generateCSS = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset)
    const stopsStr = sortedStops.map(stop =>
      `${stop.color} ${stop.offset}%`
    ).join(', ')

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`
    } else {
      return `radial-gradient(circle, ${stopsStr})`
    }
  }

  const generateSVGFilter = () => {
    if (!noise.enabled) return ''

    const filterId = 'distortion-filter'
    return `<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="${filterId}">
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
  </defs>
</svg>`
  }

  const getFilterStyle = () => {
    if (!noise.enabled) return {}
    return {
      filter: 'url(#distortion-filter)'
    }
  }

  const generateCode = () => {
    const css = generateCSS()
    const filterCSS = noise.enabled ? `  filter: url(#distortion-filter);\n` : ''

    const html = noise.enabled ? `<!-- SVG Filter Definition -->
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="distortion-filter">
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
  </defs>
</svg>

` : ''

    return `${html}<!-- Gradient Background -->
<div class="gradient-background"></div>

<style>
.gradient-background {
  width: 100%;
  height: 100vh;
  background: ${css};
${filterCSS}}
</style>`
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateCode())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadHTML = () => {
    const code = generateCode()
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gradient-background.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const cssGradient = generateCSS()
  const code = generateCode()

  return (
    <div className="app">
      {noise.enabled && (
        <div dangerouslySetInnerHTML={{ __html: generateSVGFilter() }} />
      )}

      <header>
        <h1>CSS Gradient Generator</h1>
        <p>Create beautiful gradient backgrounds for your projects</p>
      </header>

      <div className="container">
        <div className="preview-section">
          <h2>Preview</h2>
          <div
            className="preview"
            style={{
              background: cssGradient,
              ...getFilterStyle()
            }}
          />
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
            <button onClick={copyCode} className="action-button primary">
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={downloadHTML} className="action-button">
              Download HTML
            </button>
          </div>
        </div>
      </div>

      <div className="code-section">
        <h2>HTML & CSS Code</h2>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  )
}

export default App
