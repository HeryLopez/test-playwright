import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import buttonBlock from '../domains/block-button'
import carouselBlock from '../domains/block-carousel'
import imageBlock from '../domains/block-image'
import spacerBlock from '../domains/block-spacer'
import textBlock from '../domains/block-text'
import { Canvas, useCanvas } from '../domains/canvas'
import { ImportExportModal } from '../domains/editor-io'
import { ComponentPalette } from '../domains/palette'
import { PropertiesPanel } from '../domains/properties'
import { BurgerMenu } from '../shared/components'
import './EditorPage.css'

const BLOCKS = [textBlock, imageBlock, carouselBlock, spacerBlock, buttonBlock]
const BLOCKS_MAP = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))

function EditorPage() {
  const navigate = useNavigate()
  const [showIO, setShowIO] = useState(false)
  const {
    components,
    selectedId,
    selectedComponent,
    addComponentAt,
    reorderComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    deselectAll,
    loadComponents,
  } = useCanvas(BLOCKS_MAP)

  return (
    <div className="editor-layout">
      <BurgerMenu />
      <header className="editor-header">
        <h1 className="editor-header-title">Content Editor</h1>
        <button
          className="editor-io-btn"
          onClick={() => setShowIO(true)}
          data-testid="io-btn"
        >
          JSON
        </button>
        <button
          className="editor-preview-btn"
          onClick={() => navigate('/preview', { state: { components } })}
          data-testid="preview-btn"
        >
          Preview
        </button>
      </header>
      <div className="editor-body">
        <ComponentPalette blocks={BLOCKS} />
        <Canvas
          components={components}
          selectedId={selectedId}
          blocksMap={BLOCKS_MAP}
          onDropNew={addComponentAt}
          onReorder={reorderComponent}
          onSelectComponent={selectComponent}
          onDeselectAll={deselectAll}
        />
        <PropertiesPanel component={selectedComponent} blocks={BLOCKS} onUpdate={updateComponent} onDelete={removeComponent} />
      </div>
      {showIO && (
        <ImportExportModal
          components={components}
          onImport={loadComponents}
          onClose={() => setShowIO(false)}
        />
      )}
    </div>
  )
}

export default EditorPage
