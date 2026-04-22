import './IconButton.css'

/**
 * IconButton — a small toggle/action button that can show an icon and/or a label.
 *
 * Props:
 *   icon      {string|ReactNode}  — icon character or element shown before the label
 *   label     {string}            — text label (optional)
 *   active    {boolean}           — highlights the button as selected
 *   onClick   {function}
 *   title     {string}            — tooltip / aria-label
 *   testId    {string}            — data-testid value
 *   disabled  {boolean}
 */
function IconButton({ icon, label, active = false, onClick, title, testId, disabled = false }) {
  return (
    <button
      type="button"
      className={`icon-btn${active ? ' icon-btn--active' : ''}${disabled ? ' icon-btn--disabled' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      data-testid={testId}
      disabled={disabled}
    >
      {icon && <span className="icon-btn__icon">{icon}</span>}
      {label && <span className="icon-btn__label">{label}</span>}
    </button>
  )
}

export default IconButton
