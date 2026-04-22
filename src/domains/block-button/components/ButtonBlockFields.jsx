import { NumberField, TextField, ToggleGroupField } from '../../../shared/components'

const VARIANT_OPTIONS = [
  { value: 'primary',   label: 'Primary',   icon: '●' },
  { value: 'secondary', label: 'Secondary', icon: '◐' },
  { value: 'outline',   label: 'Outline',   icon: '○' },
]

const SIZE_OPTIONS = [
  { value: 'small',  label: 'S', icon: '' },
  { value: 'medium', label: 'M', icon: '' },
  { value: 'large',  label: 'L', icon: '' },
]

function ButtonBlockFields({ props, onChange }) {
  return (
    <>
      <TextField
        id="prop-label"
        label="Label"
        value={props.label}
        rows={1}
        onChange={(val) => onChange({ label: val })}
        testId="prop-label"
      />

      <ToggleGroupField
        label="Variant"
        value={props.variant}
        options={VARIANT_OPTIONS}
        onChange={(val) => onChange({ variant: val })}
        testId="prop-variant"
      />

      <ToggleGroupField
        label="Size"
        value={props.size}
        options={SIZE_OPTIONS}
        onChange={(val) => onChange({ size: val })}
        testId="prop-size"
      />

      <ToggleGroupField
        label="Alignment"
        value={props.align}
        onChange={(val) => onChange({ align: val })}
        testId="prop-align"
      />

      <NumberField
        id="prop-borderRadius"
        label="Border radius (px)"
        value={props.borderRadius}
        min={0}
        max={50}
        onChange={(val) => onChange({ borderRadius: val })}
        testId="prop-borderRadius"
      />
    </>
  )
}

export default ButtonBlockFields
