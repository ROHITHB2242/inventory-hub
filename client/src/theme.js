// src/theme.js
// Purpose: Define the global MUI CSS color system, fonts, and input field templates.

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Enforce dark theme
    primary: {
      main: '#4f46e5', // Brand indigo accent
      light: '#818cf8',
      dark: '#4338ca'
    },
    secondary: {
      main: '#06b6d4', // Secondary teal/cyan highlights
      light: '#22d3ee',
      dark: '#0891b2'
    },
    background: {
      default: '#090d16', // Deep space dark background
      paper: '#111827'    // Slate gray block elements
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8'
    },
    error: {
      main: '#ef4444'
    },
    warning: {
      main: '#f59e0b'
    },
    success: {
      main: '#10b981'
    },
    divider: '#1f2633'
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', 'Roboto', 'sans-serif'",
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.5px'
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.3px'
    },
    h6: {
      fontWeight: 600
    },
    body1: {
      fontSize: '0.95rem',
      color: '#cbd5e1'
    },
    body2: {
      color: '#94a3b8'
    },
    button: {
      textTransform: 'none', // Remove all-caps lock on buttons
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    // Custom settings for text inputs
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small'
      },
      styleOverrides: {
        root: {
          '& label': {
            color: '#64748b' // Slate label text
          },
          '& label.Mui-focused': {
            color: '#818cf8' // Indigo focused label
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#0f172a', // Dark interior fill
            '& fieldset': {
              borderColor: '#1f2633' // Soft slate border outline
            },
            '&:hover fieldset': {
              borderColor: '#475569' // High-contrast hover outline
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4f46e5' // Glowing indigo outline on focus
            }
          }
        }
      }
    },
    // Custom settings for select menus
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#0f172a'
        }
      }
    },
    // Custom settings for flat cards/papers
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none' // Remove default grey linear overlay on papers
        }
      }
    },
    // Custom styling adjustments for the table headers
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #1f2633',
          padding: '12px 16px'
        }
      }
    }
  }
});

export default theme;
