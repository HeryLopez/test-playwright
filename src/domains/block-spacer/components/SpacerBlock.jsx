import './SpacerBlock.css'

function SpacerBlock({ component, isSelected, isPreview, onClick }) {
  const { props } = component

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  if (isPreview) {
    return (
      <div
        className="spacer-block spacer-block--preview"
        style={{ height: props.height }}
        data-testid="preview-item"
      />
    )
  }

  return (
    <div
      className={`spacer-block${isSelected ? ' spacer-block--selected' : ''}`}
      style={{ height: props.height }}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      data-testid="canvas-item"
    >
      <span className="spacer-block__label">Spacer — {props.height}px</span>
    </div>
  )
}

export default SpacerBlock
