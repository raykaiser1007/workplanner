import { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import LoginPage from '../pages/LoginPage'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <LoginPage />
}
