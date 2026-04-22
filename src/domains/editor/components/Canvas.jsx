import { Fragment, useState } from 'react'
import { COMPONENT_TYPES } from '../models/componentTypes'
import './Canvas.css'
import TextBlock from './TextBlock'

function DropZone({ index, isActive, onDragOver, onDrop }) {
  return (
    <div
      className={`drop-zone${isActive ? ' drop-zone--active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(index) }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e, index) }}
      data-testid={`drop-zone-${index}`}
    />
  )
}

function Canvas({ components, selectedId, onDropNew, onReorder, onSelectComponent, onDeselectAll }) {
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDrop = (e, index) => {
    const type = e.dataTransfer.getData('componentType')
    const id = e.dataTransfer.getData('componentId')
    if (type) onDropNew(type, index)
    else if (id) onReorder(id, index)
    setDragOverIndex(null)
  }

  const handleCanvasDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null)
    }
  }

  const renderComponent = (component) => {
    switch (component.type) {
      case COMPONENT_TYPES.TEXT:
        return (
          <TextBlock
            component={component}
            isSelected={component.id === selectedId}
            onClick={() => onSelectComponent(component.id)}
          />
        )
      default:
        return null
    }
  }

  return (
    <main
      className="canvas"
      onDragLeave={handleCanvasDragLeave}
      onClick={onDeselectAll}
      data-testid="editor-canvas"
    >
      {components.length === 0 ? (
        <div
          className={`canvas-empty${dragOverIndex === 0 ? ' canvas-empty--active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0) }}
          onDrop={(e) => { e.preventDefault(); handleDrop(e, 0) }}
          data-testid="drop-zone-0"
        >
          <span className="canvas-empty-label">Drag components here</span>
        </div>
      ) : (
        <>
          <DropZone
            index={0}
            isActive={dragOverIndex === 0}
            onDragOver={setDragOverIndex}
            onDrop={handleDrop}
          />
          {components.map((component, i) => (
            <Fragment key={component.id}>
              {renderComponent(component)}
              <DropZone
                index={i + 1}
                isActive={dragOverIndex === i + 1}
                onDragOver={setDragOverIndex}
                onDrop={handleDrop}
              />
            </Fragment>
          ))}
        </>
      )}
    </main>
  )
}

export default Canvas
