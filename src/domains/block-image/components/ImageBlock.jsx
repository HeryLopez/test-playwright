import './ImageBlock.css'

function ImageBlock({ component, isSelected, isPreview, onClick }) {
  const { props } = component

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const img = (
    <img
      src={props.src}
      alt={props.alt}
      className="image-block__img"
      style={{
        width: `${props.width}%`,
        borderRadius: props.borderRadius,
      }}
      draggable={false}
    />
  )

  if (isPreview) {
    return (
      <div
        className={`image-block image-block--preview image-block--align-${props.align}`}
        data-testid="preview-item"
      >
        {img}
      </div>
    )
  }

  return (
    <div
      className={`image-block image-block--align-${props.align}${isSelected ? ' image-block--selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      data-testid="canvas-item"
    >
      {img}
    </div>
  )
}

export default ImageBlock
