import './ComponentPalette.css'

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

function ComponentPalette({ blocks }) {
  return (
    <aside className="component-palette" data-testid="component-palette">
      <h2 className="palette-title">Components</h2>
      <div className="palette-list">
        {blocks.map((block) => (
          <PaletteItem key={block.type} type={block.type} label={block.label} icon={block.icon} />
        ))}
      </div>
    </aside>
  )
}

export default ComponentPalette
