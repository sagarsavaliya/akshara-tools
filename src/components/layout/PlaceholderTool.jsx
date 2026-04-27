import { Link } from 'react-router-dom'

export default function PlaceholderTool({ title, description }) {
  return (
    <div className="placeholderPage">
      <h1>{title}</h1>
      <p>
        {description
          ?? 'This calculator is in the delivery queue. The salary tool is live first; others follow in the same design system.'}
      </p>
      <div className="placeholderActions">
        <Link to="/" className="btn-secondary">← Back to all tools</Link>
        <Link to="/salary-calculator" className="btn-secondary">Try Salary →</Link>
      </div>
    </div>
  )
}
