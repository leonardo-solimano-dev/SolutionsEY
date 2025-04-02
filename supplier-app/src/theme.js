import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#FFC107', // EY Yellow
            contrastText: '#000000', // EY Black para texto sobre amarillo
        },
        secondary: {
            main: '#333333', // EY Dark Gray
            contrastText: '#FFFFFF', // EY White para texto sobre gris oscuro
        },
        success: {
            main: '#2e7d32', // Verde para botones de éxito (no es parte de EY, pero lo mantenemos)
        },
        error: {
            main: '#d32f2f', // Rojo para errores (no es parte de EY, pero lo mantenemos)
        },
        warning: {
            main: '#ed6c02', // Naranja para advertencias (no es parte de EY, pero lo mantenemos)
        },
        background: {
            default: '#FFFFFF', // EY White para el fondo principal
            paper: '#E0E0E0', // EY Light Gray para fondos de componentes como tablas
        },
        text: {
            primary: '#000000', // EY Black para texto principal
            secondary: '#333333', // EY Dark Gray para texto secundario
        },
    },
    typography: {
        fontFamily: '"Arial", "Helvetica", "sans-serif"',
        h4: {
            fontWeight: 700,
            color: '#000000', // EY Black para títulos
        },
        h6: {
            fontWeight: 600,
            color: '#000000', // EY Black para subtítulos
        },
        body1: {
            color: '#000000', // EY Black para texto general
        },
        body2: {
            fontSize: '0.875rem',
            color: '#333333', // EY Dark Gray para texto secundario
        },
    },
});

export default theme;