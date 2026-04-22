import { useLocation, useNavigate } from 'react-router-dom'
import buttonBlock from '../domains/block-button'
import imageBlock from '../domains/block-image'
import spacerBlock from '../domains/block-spacer'
import textBlock from '../domains/block-text'
import { PreviewCanvas } from '../domains/preview'
import './PreviewPage.css'

const BLOCKS = [textBlock, imageBlock, spacerBlock, buttonBlock]
const BLOCKS_MAP = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))

function PreviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const components = location.state?.components ?? []

  return (
    <div className="preview-layout-root">
    <div className="preview-layout">
      <header className="preview-header">
        <button className="preview-back-btn" onClick={() => navigate(-1)}>
          ← Back to Editor
        </button>
        <span className="preview-header-title">Preview</span>
        <div className="preview-header-json">
          <details>
            <summary>JSON</summary>
            <pre>{JSON.stringify(components, null, 2)}</pre>
          </details>
        </div>
      </header>
      <main className="preview-body">
        <PreviewCanvas components={components} blocksMap={BLOCKS_MAP} />
      </main>
    </div>
    </div>
  )
}

export default PreviewPage
