import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import './BurgerMenu.css'

function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: '/', label: '🏠 Editor', icon: '✏️' },
    { path: '/scraping', label: '🔍 Site Scraper', icon: '📊' },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      <button
        className="burger-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        data-testid="burger-menu-btn"
      >
        <span className={`burger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {isOpen && (
        <>
          <div className="burger-menu-overlay" onClick={() => setIsOpen(false)} />
          <nav className="burger-menu-nav">
            <div className="burger-menu-header">
              <h3>Navigation</h3>
              <button
                className="burger-menu-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <ul className="burger-menu-list">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    className={`burger-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                    data-testid={`menu-item-${item.path.slice(1) || 'editor'}`}
                  >
                    <span className="burger-menu-icon">{item.icon}</span>
                    <span className="burger-menu-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  )
}

export default BurgerMenu
