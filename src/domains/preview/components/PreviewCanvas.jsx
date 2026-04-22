import './PreviewCanvas.css'

function PreviewCanvas({ components, blocksMap }) {
  if (components.length === 0) {
    return (
      <div className="preview-canvas preview-canvas--empty">
        <p className="preview-canvas-empty-msg">No components to preview yet.</p>
      </div>
    )
  }

  return (
    <div className="preview-canvas">
      {components.map((component) => {
        const blockDef = blocksMap[component.type]
        if (!blockDef) return null
        const Block = blockDef.Block
        return (
          <Block
            key={component.id}
            component={component}
            isSelected={false}
            isPreview={true}
            onClick={() => {}}
          />
        )
      })}
    </div>
  )
}

export default PreviewCanvas
