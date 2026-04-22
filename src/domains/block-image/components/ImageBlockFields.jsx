import { NumberField, TextField, ToggleGroupField } from '../../../shared/components'

const ALIGN_OPTIONS = [
  { value: 'left',   label: 'Left',   icon: '←' },
  { value: 'center', label: 'Center', icon: '↔' },
  { value: 'right',  label: 'Right',  icon: '→' },
]

function ImageBlockFields({ props, onChange }) {
  return (
    <>
      <TextField
        id="prop-src"
        label="Image URL"
        value={props.src}
        rows={2}
        onChange={(val) => onChange({ src: val })}
        testId="prop-src"
      />

      <TextField
        id="prop-alt"
        label="Alt text"
        value={props.alt}
        rows={1}
        onChange={(val) => onChange({ alt: val })}
        testId="prop-alt"
      />

      <NumberField
        id="prop-width"
        label="Width (%)"
        value={props.width}
        min={10}
        max={100}
        step={5}
        onChange={(val) => onChange({ width: val })}
        testId="prop-width"
      />

      <NumberField
        id="prop-borderRadius"
        label="Border radius (px)"
        value={props.borderRadius}
        min={0}
        max={999}
        step={2}
        onChange={(val) => onChange({ borderRadius: val })}
        testId="prop-borderRadius"
      />

      <ToggleGroupField
        label="Alignment"
        value={props.align}
        options={ALIGN_OPTIONS}
        onChange={(val) => onChange({ align: val })}
        testId="prop-align"
      />
    </>
  )
}

export default ImageBlockFields
