import { NumberField } from '../../../shared/components'

function SpacerBlockFields({ props, onChange }) {
  return (
    <NumberField
      id="prop-height"
      label="Height (px)"
      value={props.height}
      min={8}
      max={400}
      step={4}
      onChange={(val) => onChange({ height: val })}
      testId="prop-height"
    />
  )
}

export default SpacerBlockFields
