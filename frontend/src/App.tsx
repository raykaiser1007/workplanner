import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}

export default App