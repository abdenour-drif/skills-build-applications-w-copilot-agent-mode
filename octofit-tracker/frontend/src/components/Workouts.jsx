import { useEffect, useState } from 'react'
import { API_BASE_URL, parseCollectionResponse } from '../api.js'
import CollectionPage from './CollectionPage.jsx'

const columns = [
  { label: 'Workout', value: (workout) => workout.title },
  { label: 'Activity', value: (workout) => workout.activityType },
  { label: 'Description', value: (workout) => workout.description },
  { label: 'Duration (minutes)', value: (workout) => workout.durationMinutes },
  { label: 'Difficulty', value: (workout) => workout.difficulty },
]

function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkouts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/workouts/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }
        setWorkouts(parseCollectionResponse(await response.json()))
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

    loadWorkouts()
    return () => controller.abort()
  }, [])

  return (
    <CollectionPage
      columns={columns}
      description="Personalized ideas for your next workout."
      error={error}
      loading={loading}
      records={workouts}
      title="Workouts"
    />
  )
}

export default Workouts
