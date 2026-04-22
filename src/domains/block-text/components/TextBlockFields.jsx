import { ColorField, NumberField, TextField, ToggleGroupField } from '../../../shared/components'

function TextBlockFields({ props, onChange }) {
  return (
    <>
      <TextField
        id="prop-text"
        label="Text"
        value={props.text}
        rows={3}
        onChange={(val) => onChange({ text: val })}
        testId="prop-text"
      />

      <NumberField
        id="prop-fontSize"
        label="Font size (px)"
        value={props.fontSize}
        min={8}
        max={96}
        onChange={(val) => onChange({ fontSize: val })}
        testId="prop-fontSize"
      />

      <ColorField
        id="prop-color"
        label="Color"
        value={props.color}
        onChange={(val) => onChange({ color: val })}
        testId="prop-color"
      />

      <ToggleGroupField
        value={props.textAlign}
        onChange={(val) => onChange({ textAlign: val })}
        testId="prop-textAlign"
      />
    </>
  )
}

export default TextBlockFields
