import { useNavigate } from 'react-router-dom'
import spacerBlock from '../domains/block-spacer'
import textBlock from '../domains/block-text'
import { Canvas, useCanvas } from '../domains/canvas'
import { ComponentPalette } from '../domains/palette'
import { PropertiesPanel } from '../domains/properties'
import './EditorPage.css'

const BLOCKS = [textBlock, spacerBlock]
const BLOCKS_MAP = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))

function EditorPage() {
  const navigate = useNavigate()
  const {
    components,
    selectedId,
    selectedComponent,
    addComponentAt,
    reorderComponent,
    updateComponent,
    selectComponent,
    deselectAll,
  } = useCanvas(BLOCKS_MAP)

  return (
    <div className="editor-layout">
      <header className="editor-header">
        <h1 className="editor-header-title">Home Editor</h1>
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
        <PropertiesPanel component={selectedComponent} blocks={BLOCKS} onUpdate={updateComponent} />
      </div>
    </div>
  )
}

export default EditorPage
