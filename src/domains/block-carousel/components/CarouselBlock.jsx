import { useState } from 'react'
import './CarouselBlock.css'

function CarouselBlock({ component, isSelected, isPreview, onClick }) {
  const { props } = component
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides = props.slides ?? []
  const safeIndex = Math.min(currentIndex, slides.length - 1)

  const prev = (e) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
  }

  const next = (e) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1))
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const inner = (
    <>
      <div
        className="carousel-block__viewport"
        style={{
          height: props.height + 'px',
          borderRadius: props.borderRadius + 'px',
        }}
      >
        <div
          className="carousel-block__track"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="carousel-block__slide">
              <img
                src={slide.src}
                alt={slide.alt}
                className="carousel-block__img"
                draggable={false}
              />
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button
              className="carousel-block__btn carousel-block__btn--prev"
              onClick={prev}
              aria-label="Previous slide"
              data-testid="carousel-btn-prev"
            >
              &#8249;
            </button>
            <button
              className="carousel-block__btn carousel-block__btn--next"
              onClick={next}
              aria-label="Next slide"
              data-testid="carousel-btn-next"
            >
              &#8250;
            </button>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="carousel-block__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`carousel-block__dot${i === safeIndex ? ' carousel-block__dot--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(i)
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )

  if (isPreview) {
    return (
      <div
        className="carousel-block carousel-block--preview"
        data-testid="preview-item"
        data-carousel-block="true"
      >
        {inner}
      </div>
    )
  }

  return (
    <div
      className={`carousel-block${isSelected ? ' carousel-block--selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      data-testid="canvas-item"
      data-carousel-block="true"
    >
      {inner}
    </div>
  )
}

export default CarouselBlock
