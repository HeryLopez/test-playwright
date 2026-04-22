import './PropertiesPanel.css'

function PropertiesPanel({ component, onUpdate }) {
  if (!component) {
    return (
      <aside className="properties-panel properties-panel--empty" data-testid="properties-panel">
        <p className="properties-empty-msg">Select a component to edit its properties</p>
      </aside>
    )
  }

  const { props } = component

  const handleChange = (key, value) => {
    onUpdate(component.id, { [key]: value })
  }

  return (
    <aside className="properties-panel" data-testid="properties-panel">
      <h2 className="properties-title">Properties</h2>

      <div className="property-group">
        <label htmlFor="prop-text">Text</label>
        <textarea
          id="prop-text"
          value={props.text}
          onChange={(e) => handleChange('text', e.target.value)}
          rows={3}
          data-testid="prop-text"
        />
      </div>

      <div className="property-group">
        <label htmlFor="prop-fontSize">Font size (px)</label>
        <input
          type="number"
          id="prop-fontSize"
          value={props.fontSize}
          min={8}
          max={96}
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
          data-testid="prop-fontSize"
        />
      </div>

      <div className="property-group">
        <label htmlFor="prop-color">Color</label>
        <input
          type="color"
          id="prop-color"
          value={props.color}
          onChange={(e) => handleChange('color', e.target.value)}
          data-testid="prop-color"
        />
      </div>
    </aside>
  )
}

export default PropertiesPanel
