import { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import LoginPage from '../pages/LoginPage'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <LoginPage />
}
