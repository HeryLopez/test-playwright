import { useEffect, useRef, useState } from 'react'
import './ImportExportModal.css'

function ImportExportModal({ components, onImport, onClose }) {
  const [tab, setTab] = useState('export')
  const [importText, setImportText] = useState('')
  const [error, setError] = useState(null)
  const overlayRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const json = JSON.stringify(components, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(json)
  }

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'editor-content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadDemo = async () => {
    try {
      const res = await fetch('/demo-homepage.json')
      const data = await res.json()
      setImportText(JSON.stringify(data, null, 2))
      setError(null)
    } catch {
      setError('Could not load demo content')
    }
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array of components')
      onImport(parsed)
      onClose()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div
      className="ie-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      data-testid="ie-modal"
    >
      <div className="ie-modal">
        <div className="ie-modal__header">
          <div className="ie-tabs">
            <button
              className={`ie-tab${tab === 'export' ? ' ie-tab--active' : ''}`}
              onClick={() => setTab('export')}
            >Export</button>
            <button
              className={`ie-tab${tab === 'import' ? ' ie-tab--active' : ''}`}
              onClick={() => setTab('import')}
            >Import</button>
          </div>
          <button className="ie-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {tab === 'export' && (
          <div className="ie-modal__body">
            <p className="ie-hint">Copy or download the JSON to save your layout.</p>
            <pre className="ie-json" data-testid="export-json">{json}</pre>
            <div className="ie-actions">
              <button className="ie-btn" onClick={handleCopy} data-testid="copy-json-btn">Copy JSON</button>
              <button className="ie-btn ie-btn--primary" onClick={handleDownload} data-testid="download-json-btn">Download</button>
            </div>
          </div>
        )}

        {tab === 'import' && (
          <div className="ie-modal__body">
            <p className="ie-hint">Paste a JSON array of components to replace the current canvas.</p>
            <div className="ie-import-actions-top">
              <button className="ie-btn ie-btn--demo" onClick={handleLoadDemo} data-testid="load-demo-btn">
                ✦ Load homepage demo
              </button>
            </div>
            <textarea
              className="ie-import-input"
              placeholder='[{"id":"...","type":"text","props":{...}}]'
              value={importText}
              onChange={(e) => { setImportText(e.target.value); setError(null) }}
              rows={12}
              data-testid="import-json-input"
            />
            {error && <p className="ie-error">{error}</p>}
            <div className="ie-actions">
              <button className="ie-btn" onClick={onClose}>Cancel</button>
              <button
                className="ie-btn ie-btn--primary"
                onClick={handleImport}
                disabled={!importText.trim()}
                data-testid="import-json-btn"
              >Load</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportExportModal
