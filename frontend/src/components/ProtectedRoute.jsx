import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/')
      } else if (requiredRole && user.role !== requiredRole) {
        navigate('/')
      }
    }
  }, [user, loading, requiredRole, navigate])

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return user && (!requiredRole || user.role === requiredRole) ? children : null
}

export default ProtectedRoute
