import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ff9800', // Orange from DS
            dark: '#f57c00',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0', // Purple from DS
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        error: {
            main: '#d32f2f',
            dark: '#c62828',
        },
        warning: {
            main: '#ef6c00',
        },
        info: {
            main: '#0288d1',
            dark: '#01579b',
        },
        success: {
            main: '#2e7d32',
            dark: '#1b5e20',
        },
        background: {
            default: '#09090b', // Keeping Dark Mode base
            paper: '#18181b',
        },
        text: {
            primary: '#fafafa',
            secondary: '#a1a1aa',
        },
        divider: '#27272a',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '1.5rem',
            background: 'linear-gradient(to right, #fff, #a1a1aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 4, // From DS "borderRadius": "4"
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: '#ff9800', // Match Primary
                },
                thumb: {
                    boxShadow: 'none',
                    '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0px 0px 0px 8px rgba(255, 152, 0, 0.16)', // Orange shadow
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #27272a',
                    padding: '12px 16px',
                },
                head: {
                    backgroundColor: '#09090b',
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;
