// src/pages/NotFound.jsx
// Purpose: Fallback page rendered when navigation routes hit unmapped addresses (404 Error).

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at top right, #1e1b4b 0%, #090d16 100%)',
        color: '#fff'
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            textAlign: 'center'
          }}
        >
          <WarningIcon sx={{ fontSize: 72, color: '#f59e0b', mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontFamily: "'Outfit', 'Inter', sans-serif"
            }}
          >
            404 - Page Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            The resource you are looking for has been moved, removed, or is temporarily offline.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              backgroundColor: '#4f46e5',
              '&:hover': { backgroundColor: '#4338ca' },
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              py: 1
            }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
