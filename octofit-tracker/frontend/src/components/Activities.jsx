import { useEffect, useState } from 'react'
import { API_BASE_URL, parseCollectionResponse } from '../api.js'
import CollectionPage from './CollectionPage.jsx'

const columns = [
  { label: 'Activity', value: (activity) => activity.activityType },
  { label: 'User', value: (activity) => activity.user },
  { label: 'Duration (minutes)', value: (activity) => activity.durationMinutes },
  { label: 'Distance (km)', value: (activity) => activity.distanceKilometers },
  { label: 'Points', value: (activity) => activity.points },
  { label: 'Completed', value: (activity) => activity.completedAt },
]

function Activities() {
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/activities/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }
        setActivities(parseCollectionResponse(await response.json()))
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

    loadActivities()
    return () => controller.abort()
  }, [])

  return (
    <CollectionPage
      columns={columns}
      description="Recent workouts and logged movement."
      error={error}
      loading={loading}
      records={activities}
      title="Activities"
    />
  )
}

export default Activities
