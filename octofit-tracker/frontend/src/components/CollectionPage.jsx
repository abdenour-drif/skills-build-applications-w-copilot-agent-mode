import { formatCellValue } from '../api.js'

function CollectionPage({ columns, description, error, loading, records, title }) {
  return (
    <main className="container collection-page">
      <div className="collection-heading">
        <p className="eyebrow">Octofit Tracker</p>
        <h1>{title}</h1>
        <p className="collection-description">{description}</p>
      </div>

      {loading && (
        <p aria-live="polite" className="alert alert-info">
          Loading {title.toLowerCase()}...
        </p>
      )}
      {error && (
        <p aria-live="polite" className="alert alert-danger">
          Could not load {title.toLowerCase()}: {error}
        </p>
      )}
      {!loading && !error && records.length === 0 && (
        <p className="alert alert-secondary">No {title.toLowerCase()} found.</p>
      )}
      {!loading && !error && records.length > 0 && (
        <div className="table-responsive collection-table-wrap">
          <table className="table table-hover align-middle collection-table">
            <thead>
              <tr>
                {columns.map(({ label }) => (
                  <th key={label} scope="col">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id || record.id || `${title}-${index}`}>
                  {columns.map(({ label, value }) => (
                    <td key={label}>{formatCellValue(value(record))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default CollectionPage
