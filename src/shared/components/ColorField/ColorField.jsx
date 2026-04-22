import '../field.css'

/**
 * ColorField — label + color picker inside a field-group wrapper.
 *
 * Props:
 *   id       {string}
 *   label    {string}
 *   value    {string}   hex color, e.g. '#000000'
 *   onChange {function} receives the new hex string
 *   testId   {string}
 */
function ColorField({ id, label, value, onChange, testId }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        type="color"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="field-color"
      />
    </div>
  )
}

export default ColorField
