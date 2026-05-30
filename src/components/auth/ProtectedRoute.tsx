import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  children: React.ReactNode
  requireKyc?: boolean
}

export function ProtectedRoute({ children, requireKyc }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  if (requireKyc && user.kycStatus !== 'pix_configured') {
    return <Navigate to="/verificacao" replace />
  }

  return <>{children}</>
}
