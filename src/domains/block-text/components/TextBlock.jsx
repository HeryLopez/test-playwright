import './TextBlock.css'

function TextBlock({ component, isSelected, isPreview, onClick }) {
  const { props } = component

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  if (isPreview) {
    return (
      <div className="text-block text-block--preview" data-testid="preview-item">
        <p style={{ margin: 0, fontSize: props.fontSize, color: props.color, textAlign: props.textAlign }}>
          {props.text}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`text-block${isSelected ? ' text-block--selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      data-testid="canvas-item"
    >
      <p style={{ margin: 0, fontSize: props.fontSize, color: props.color, textAlign: props.textAlign }}>
        {props.text}
      </p>
    </div>
  )
}

export default TextBlock
