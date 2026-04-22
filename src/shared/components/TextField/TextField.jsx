import '../field.css'

/**
 * TextField — label + textarea inside a field-group wrapper.
 *
 * Props:
 *   id       {string}
 *   label    {string}
 *   value    {string}
 *   rows     {number}   default: 3
 *   onChange {function} receives the new string value
 *   testId   {string}
 */
function TextField({ id, label, value, rows = 3, onChange, testId }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
      />
    </div>
  )
}

export default TextField
