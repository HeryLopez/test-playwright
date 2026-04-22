import './TextBlock.css'

function TextBlock({ component, isSelected, onClick }) {
  const { props } = component

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
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
      <p style={{ margin: 0, fontSize: props.fontSize, color: props.color }}>
        {props.text}
      </p>
    </div>
  )
}

export default TextBlock
