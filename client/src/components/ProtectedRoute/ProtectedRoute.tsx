import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute token:', token);

  if (!token) {
    console.log('No token - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Token exists - showing dashboard');
  return <Outlet />;
};

export default ProtectedRoute;