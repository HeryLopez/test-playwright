import './PropertiesPanel.css'

function PropertiesPanel({ component, blocks, onUpdate }) {
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
      <h2 className="properties-title">Properties</h2>
      <Fields
        props={component.props}
        onChange={(newProps) => onUpdate(component.id, newProps)}
      />
    </aside>
  )
}

export default PropertiesPanel
