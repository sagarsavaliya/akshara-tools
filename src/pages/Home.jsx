import { Link } from 'react-router-dom'
import { appTools } from '../config/appConfig.js'

export default function Home() {
  return (
    <section>
      <div className="homeHero">
        <span className="homeEyebrow">Akshara Tools</span>
        <h1 className="homeHeadline">Clear calculators for salary, tax, loans, and health</h1>
        <p className="homeLead">
          Fast, readable estimates for India — no signup to use the tools. Numbers follow
          config-driven rules (e.g. FY 2026-27 salary model) so you can plan with confidence.
        </p>
      </div>
      <div className="toolGridHome">
        {appTools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className={
              tool.id === 'salary-calculator'
                ? 'toolCardHome toolCardHomeFeatured'
                : 'toolCardHome'
            }
          >
            {(tool.id === 'salary-calculator' || tool.id === 'gst-calculator') ? (
              <span className="toolCardBadge">Live</span>
            ) : null}
            <strong>{tool.title}</strong>
            <span>{tool.blurb}</span>
            <span className="toolCardCta">Open</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
