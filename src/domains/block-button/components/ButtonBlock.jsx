import './ButtonBlock.css'

function ButtonBlock({ component, isSelected, isPreview, onClick }) {
  const { props } = component

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const btn = (
    <button
      className={`btn-block__btn btn-block__btn--${props.variant} btn-block__btn--${props.size}`}
      style={{ borderRadius: props.borderRadius }}
      tabIndex={-1}
      onClick={(e) => e.preventDefault()}
    >
      {props.label}
    </button>
  )

  if (isPreview) {
    return (
      <div
        className={`btn-block btn-block--preview btn-block--align-${props.align}`}
        data-testid="preview-item"
      >
        {btn}
      </div>
    )
  }

  return (
    <div
      className={`btn-block btn-block--align-${props.align}${isSelected ? ' btn-block--selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      data-testid="canvas-item"
    >
      {btn}
    </div>
  )
}

export default ButtonBlock
