import { useState } from 'react'
import { appTools } from '../config/appConfig.js'
import { useAuth } from '../auth/useAuth.js'

export default function Admin() {
  const { session, logout } = useAuth()
  const [activeToolId, setActiveToolId] = useState(appTools[0].id)

  return (
    <section>
      <h1>Admin Panel</h1>
      <p>{`Logged in as ${session?.email}`}</p>
      <button type="button" className="btn-secondary" onClick={logout}>Sign Out</button>
      <div className="tool-grid">
        {appTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={activeToolId === tool.id ? 'tool-card active' : 'tool-card'}
            onClick={() => setActiveToolId(tool.id)}
          >
            {tool.name}
          </button>
        ))}
      </div>
      <p>{`Moderation queue for ${activeToolId} will be loaded from API in next task.`}</p>
    </section>
  )
}
