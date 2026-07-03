// src/components/ProtectedRoute.jsx
// Purpose: Guard router paths from unauthenticated access, redirecting to login.

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Route protection wrapper. Checks authentication state.
 * Redirects to /login if unauthenticated, shows loading spinner if state is resolving.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#0d0f13',
        }}
      >
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }

  // Redirect to login if user session is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if user session is valid
  return <Outlet />;
}
