import { useEffect, useState } from 'react'
import { API_BASE_URL, parseCollectionResponse } from '../api.js'
import CollectionPage from './CollectionPage.jsx'

const columns = [
  { label: 'Rank', value: (entry) => entry.rank },
  { label: 'User', value: (entry) => entry.user },
  { label: 'Points', value: (entry) => entry.points },
  { label: 'Period', value: (entry) => entry.period },
]

function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadLeaderboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }
        setEntries(parseCollectionResponse(await response.json()))
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

    loadLeaderboard()
    return () => controller.abort()
  }, [])

  return (
    <CollectionPage
      columns={columns}
      description="Compare points and rankings across the team."
      error={error}
      loading={loading}
      records={entries}
      title="Leaderboard"
    />
  )
}

export default Leaderboard
