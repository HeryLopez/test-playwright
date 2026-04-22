import { NumberField, TextField } from '../../../shared/components'
import './CarouselBlock.css'

function CarouselBlockFields({ props, onChange }) {
  const updateSlide = (index, key, value) => {
    const newSlides = props.slides.map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    )
    onChange({ slides: newSlides })
  }

  const addSlide = () => {
    const n = props.slides.length + 1
    onChange({
      slides: [
        ...props.slides,
        {
          src: `https://picsum.photos/seed/carousel-${n}/800/400`,
          alt: `Slide ${n}`,
        },
      ],
    })
  }

  const removeSlide = (index) => {
    if (props.slides.length <= 1) return
    onChange({ slides: props.slides.filter((_, i) => i !== index) })
  }

  return (
    <>
      <div className="property-group">
        <span className="carousel-slides-label">Slides</span>
        {props.slides.map((slide, i) => (
          <div key={i} className="carousel-slide-item">
            <div className="carousel-slide-item__header">
              <span>Slide {i + 1}</span>
              <button
                className="carousel-slide-remove-btn"
                onClick={() => removeSlide(i)}
                disabled={props.slides.length <= 1}
                title="Remove slide"
              >
                ✕
              </button>
            </div>
            <TextField
              id={`slide-src-${i}`}
              label="Image URL"
              value={slide.src}
              rows={2}
              onChange={(val) => updateSlide(i, 'src', val)}
            />
            <TextField
              id={`slide-alt-${i}`}
              label="Alt text"
              value={slide.alt}
              rows={1}
              onChange={(val) => updateSlide(i, 'alt', val)}
            />
          </div>
        ))}
        <button className="carousel-add-slide-btn" onClick={addSlide}>
          + Add slide
        </button>
      </div>

      <NumberField
        id="prop-height"
        label="Height (px)"
        value={props.height}
        min={100}
        max={800}
        step={10}
        onChange={(val) => onChange({ height: val })}
        testId="prop-height"
      />

      <NumberField
        id="prop-borderRadius"
        label="Border radius (px)"
        value={props.borderRadius}
        min={0}
        max={50}
        step={2}
        onChange={(val) => onChange({ borderRadius: val })}
        testId="prop-borderRadius"
      />
    </>
  )
}

export default CarouselBlockFields
