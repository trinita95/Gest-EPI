import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { frFR } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import AppLayout from './components/layout/AppLayout';
import EpiList from './pages/EpiList';
import EpiDetail from './pages/EpiDetail';
import ControleList from './pages/ControleList';
import AlertesPage from './pages/AlertesPage';
import GestionnaireList from './pages/GestionnaireList';
import TypeEpiList from './pages/TypeEpiList';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#607d8b',
            light: '#78909c',
            dark: '#455a64',
        },
        error: {
            main: '#d32f2f',
            light: '#ef5350',
        },
        warning: {
            main: '#ff9800',
            light: '#ffb74d',
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f5f5f5',
                },
            },
        },
    },
}, frFR);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AppLayout />}>
                            <Route index element={<Navigate to="/epi" replace />} />
                            <Route path="epi" element={<EpiList />} />
                            <Route path="epi/:id" element={<EpiDetail />} />
                            <Route path="controles" element={<ControleList />} />
                            <Route path="alertes" element={<AlertesPage />} />
                            <Route path="gestionnaires" element={<GestionnaireList />} />
                            <Route path="type-epi" element={<TypeEpiList />} />
                            <Route path="*" element={<Navigate to="/epi" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;