import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Typography, Box
} from '@mui/material';

// Componente para el modal de screening de proveedores
const ScreeningModal = ({ show, onHide, supplier }) => {
    // Estados para gestionar la fuente seleccionada, resultados, carga y errores
    const [source, setSource] = useState('');
    const [results, setResults] = useState({ hits: 0, results: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reinicia los estados cuando el modal se abre
    useEffect(() => {
        if (show) {
            setSource('');
            setResults({ hits: 0, results: [] });
            setError(null);
            setLoading(false);
        }
    }, [show]);

    // Obtiene los resultados de screening desde el backend
    const fetchScreeningResults = useCallback(async () => {
        if (!source) {
            setError('Por favor, selecciona una fuente.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching screening for supplier ${supplier.id} with source ${source}`);
            const response = await axios.get(
                `http://localhost:5207/api/suppliers/${supplier.id}/screening?source=${source}`,
                { headers: { 'Api-Key-EY': 'EY-PasswordApi123' } }
            );
            setResults(response.data);
        } catch (err) {
            console.error('Error fetching screening results:', err);
            setError(err.response?.data || 'Error al realizar el screening.');
        } finally {
            setLoading(false);
        }
    }, [supplier, source]);

    // Renderiza la tabla de resultados del screening
    const renderResultsTable = () => {
        if (!results.results || results.results.length === 0) {
            return <Typography>No se encontraron resultados.</Typography>;
        }

        const headers = Object.keys(results.results[0]);

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headers.map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.results.map((result, index) => (
                            <TableRow key={index}>
                                {headers.map((header) => (
                                    <TableCell key={header}>{result[header]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Dialog open={show} onClose={onHide} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#FFC107', color: '#000000' }}>
                Screening de Proveedor: {supplier?.legalName}
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Fuente</InputLabel>
                    <Select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        label="Fuente"
                    >
                        <MenuItem value="">Seleccione una fuente</MenuItem>
                        <MenuItem value="offshore">Offshore Leaks</MenuItem>
                        <MenuItem value="worldbank">World Bank</MenuItem>
                        <MenuItem value="ofac">OFAC</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchScreeningResults}
                    disabled={loading}
                    sx={{ mt: 2, mb: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Buscar'}
                </Button>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {results.hits > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Resultados encontrados: {results.hits}</Typography>
                        {renderResultsTable()}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onHide} color="secondary">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScreeningModal;