import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function ToolLayout({ tools }) {
  const { pathname } = useLocation()
  return (
    <div className="app-shell">
      <Header key={pathname} tools={tools} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
