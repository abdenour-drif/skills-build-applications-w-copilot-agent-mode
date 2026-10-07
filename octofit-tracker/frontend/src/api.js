const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()

export const API_BASE_URL = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000'

export function parseCollectionResponse(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.results)) {
      return payload.results
    }

    if (Array.isArray(payload.data)) {
      return payload.data
    }
  }

  throw new Error('The API returned an unsupported collection response.')
}

export function formatCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    const fullName = [value.firstName, value.lastName].filter(Boolean).join(' ')
    return fullName || value.name || value.username || value._id || JSON.stringify(value)
  }

  return String(value)
}
