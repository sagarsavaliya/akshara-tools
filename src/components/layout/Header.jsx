import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle.jsx'

function MenuIcon({ open }) {
  return (
    <span className="navMenuToggleIcon" aria-hidden="true">
      <span className={open ? 'navMenuToggleLine navMenuToggleLine1Open' : 'navMenuToggleLine'} />
      <span className={open ? 'navMenuToggleLine navMenuToggleLine2Open' : 'navMenuToggleLine'} />
      <span className={open ? 'navMenuToggleLine navMenuToggleLine3Open' : 'navMenuToggleLine'} />
    </span>
  )
}

export default function Header({ tools }) {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    if (!navOpen) return undefined
    const desktop = window.matchMedia('(min-width: 960px)')
    const sync = () => {
      if (desktop.matches) setNavOpen(false)
    }
    desktop.addEventListener('change', sync)
    const onKey = (e) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    if (!desktop.matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      desktop.removeEventListener('change', sync)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [navOpen])

  return (
    <>
      {navOpen ? (
        <button
          type="button"
          className="navBackdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <header className="app-header">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'brand active' : 'brand')}>
          <span className="brandMark" aria-hidden="true">
            A
          </span>
          <span className="brandText">Akshara Tools</span>
        </NavLink>
        <nav
          id="site-tool-nav"
          className={`tool-nav ${navOpen ? 'tool-navOpen' : ''}`}
          aria-label="Tools"
        >
          {tools.map((tool) => (
            <NavLink
              key={tool.id}
              to={tool.path}
              className={({ isActive }) => (isActive ? 'tool-link active' : 'tool-link')}
              onClick={() => setNavOpen(false)}
            >
              {tool.name}
            </NavLink>
          ))}
        </nav>
        <div className="headerEnd">
          {pathname === '/gst-calculator' ? (
            <Link
              to="/gst-calculator#invoice"
              className="headerGstInvoiceCta"
              onClick={() => setNavOpen(false)}
            >
              Create invoice
            </Link>
          ) : null}
          <button
            type="button"
            className="navMenuToggle"
            aria-expanded={navOpen}
            aria-controls="site-tool-nav"
            onClick={() => setNavOpen((o) => !o)}
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <MenuIcon open={navOpen} />
          </button>
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}
