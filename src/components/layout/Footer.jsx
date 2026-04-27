import { Link } from 'react-router-dom'
import { appMeta } from '../../config/appConfig.js'

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>{`© ${appMeta.footerYear} Akshara Technologies. All rights reserved.`}</p>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-use">Terms of Use</Link>
      </div>
    </footer>
  )
}
