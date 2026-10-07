import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import './App.css'

const navigation = [
  { label: 'Activities', path: '/activities' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Teams', path: '/teams' },
  { label: 'Users', path: '/users' },
  { label: 'Workouts', path: '/workouts' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container app-header-content">
          <NavLink className="app-brand" to="/users">
            Octofit Tracker
          </NavLink>
          <nav aria-label="Main navigation" className="app-navigation">
            {navigation.map(({ label, path }) => (
              <NavLink
                className={({ isActive }) =>
                  `app-navigation-link${isActive ? ' active' : ''}`
                }
                key={path}
                to={path}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Routes>
        <Route element={<Navigate replace to="/users" />} path="/" />
        <Route element={<Activities />} path="/activities" />
        <Route element={<Leaderboard />} path="/leaderboard" />
        <Route element={<Teams />} path="/teams" />
        <Route element={<Users />} path="/users" />
        <Route element={<Workouts />} path="/workouts" />
        <Route element={<Navigate replace to="/users" />} path="*" />
      </Routes>
    </div>
  )
}

export default App
