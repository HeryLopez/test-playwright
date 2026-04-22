import IconButton from '../IconButton/IconButton'
import '../field.css'

/**
 * ToggleGroupField — label + row of IconButton toggles for any option set.
 *
 * Props:
 *   label   {string}    default: 'Options'
 *   value   {string}    currently selected value
 *   options {Array<{ value, label, icon }>}  defaults to left/center/right
 *   onChange {function} receives the selected value string
 *   testId  {string}
 */

const DEFAULT_OPTIONS = [
  { value: 'left',   label: 'Left',   icon: '⬅' },
  { value: 'center', label: 'Center', icon: '↔' },
  { value: 'right',  label: 'Right',  icon: '➡' },
]

function ToggleGroupField({ label = 'Options', value, options = DEFAULT_OPTIONS, onChange, testId }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      <div className="field-toggle-group" data-testid={testId}>
        {options.map((option) => (
          <IconButton
            key={option.value}
            icon={option.icon}
            label={option.label}
            active={value === option.value}
            onClick={() => onChange(option.value)}
            title={option.label}
            testId={testId ? `${testId}-${option.value}` : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default ToggleGroupField
