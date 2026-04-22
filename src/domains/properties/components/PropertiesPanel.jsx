import './PropertiesPanel.css'

function PropertiesPanel({ component, blocks, onUpdate, onDelete }) {
  if (!component) {
    return (
      <aside className="properties-panel properties-panel--empty" data-testid="properties-panel">
        <p className="properties-empty-msg">Select a component to edit its properties</p>
      </aside>
    )
  }

  const blockDef = blocks.find((b) => b.type === component.type)
  if (!blockDef) return null

  const Fields = blockDef.Fields

  return (
    <aside className="properties-panel" data-testid="properties-panel">
      <div className="properties-header">
        <h2 className="properties-title">Properties</h2>
        <button
          className="properties-delete-btn"
          onClick={() => onDelete(component.id)}
          data-testid="delete-component-btn"
          title="Delete component"
        >
          Delete
        </button>
      </div>
      <Fields
        props={component.props}
        onChange={(newProps) => onUpdate(component.id, newProps)}
      />
    </aside>
  )
}

export default PropertiesPanel
