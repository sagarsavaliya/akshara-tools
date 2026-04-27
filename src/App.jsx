import { Navigate, Route, Routes } from 'react-router-dom'
import { appTools } from './config/appConfig.js'
import { useAuth } from './auth/useAuth.js'
import ToolLayout from './components/layout/ToolLayout.jsx'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import About from './pages/About.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfUse from './pages/TermsOfUse.jsx'
import SalaryCalculator from './tools/SalaryCalculator/index.jsx'
import GstCalculator from './tools/GSTCalculator/index.jsx'
import PlaceholderTool from './components/layout/PlaceholderTool.jsx'

function ProtectedRoute({ children }) {
  const { isSuperAdmin } = useAuth()
  return isSuperAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<ToolLayout tools={appTools} />}>
        <Route path="/" element={<Home />} />
        <Route path="/salary-calculator" element={<SalaryCalculator />} />
        <Route path="/gst-calculator" element={<GstCalculator />} />
        <Route path="/sip-calculator" element={<PlaceholderTool title="SIP Calculator" />} />
        <Route path="/emi-calculator" element={<PlaceholderTool title="EMI Calculator" />} />
        <Route path="/tdee-calculator" element={<PlaceholderTool title="TDEE Calculator" />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          )}
        />
      </Route>
    </Routes>
  )
}
