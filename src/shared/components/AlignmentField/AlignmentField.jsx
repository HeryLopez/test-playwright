import IconButton from '../IconButton/IconButton'
import '../field.css'

/**
 * AlignmentField — label + row of IconButton toggles for text alignment.
 *
 * Props:
 *   label   {string}    default: 'Alignment'
 *   value   {string}    current alignment value, e.g. 'left'
 *   options {Array<{ value, label, icon }>}  defaults to left/center/right
 *   onChange {function} receives the selected alignment string
 *   testId  {string}
 */

const DEFAULT_OPTIONS = [
  { value: 'left',   label: 'Left',   icon: '⬅' },
  { value: 'center', label: 'Center', icon: '↔' },
  { value: 'right',  label: 'Right',  icon: '➡' },
]

function AlignmentField({ label = 'Alignment', value, options = DEFAULT_OPTIONS, onChange, testId }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      <div className="field-align-group" data-testid={testId}>
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

export default AlignmentField
