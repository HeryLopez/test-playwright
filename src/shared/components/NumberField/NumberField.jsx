import '../field.css'

/**
 * NumberField — label + number input inside a field-group wrapper.
 *
 * Props:
 *   id       {string}
 *   label    {string}
 *   value    {number}
 *   min      {number}
 *   max      {number}
 *   step     {number}  default: 1
 *   onChange {function} receives the new number value
 *   testId   {string}
 */
function NumberField({ id, label, value, min, max, step = 1, onChange, testId }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        type="number"
        id={id}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={testId}
      />
    </div>
  )
}

export default NumberField
