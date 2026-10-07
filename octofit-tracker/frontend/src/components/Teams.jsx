import { useEffect, useState } from 'react'
import { API_BASE_URL, parseCollectionResponse } from '../api.js'
import CollectionPage from './CollectionPage.jsx'

const columns = [
  { label: 'Team', value: (team) => team.name },
  { label: 'Description', value: (team) => team.description },
  { label: 'Members', value: (team) => team.members?.length ?? 0 },
  { label: 'Points', value: (team) => team.points },
]

function Teams() {
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTeams() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }
        setTeams(parseCollectionResponse(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError instanceof Error ? loadError.message : 'Unexpected request error.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadTeams()
    return () => controller.abort()
  }, [])

  return (
    <CollectionPage
      columns={columns}
      description="Teams, their members, and their points."
      error={error}
      loading={loading}
      records={teams}
      title="Teams"
    />
  )
}

export default Teams
