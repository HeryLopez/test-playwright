import { COMPONENT_TYPES } from '../models/componentTypes'
import './ComponentPalette.css'

const PALETTE_ITEMS = [
  { type: COMPONENT_TYPES.TEXT, label: 'Text', icon: 'T' },
]

function PaletteItem({ type, label, icon }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className="palette-item"
      draggable
      onDragStart={handleDragStart}
      data-testid={`palette-item-${type}`}
    >
      <span className="palette-item-icon">{icon}</span>
      <span className="palette-item-label">{label}</span>
    </div>
  )
}

function ComponentPalette() {
  return (
    <aside className="component-palette" data-testid="component-palette">
      <h2 className="palette-title">Components</h2>
      <div className="palette-list">
        {PALETTE_ITEMS.map((item) => (
          <PaletteItem key={item.type} {...item} />
        ))}
      </div>
    </aside>
  )
}

export default ComponentPalette
