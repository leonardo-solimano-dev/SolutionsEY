import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Configura el punto de entrada de la aplicación React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza la aplicación con el tema de Material-UI
root.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
);