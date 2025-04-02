import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SupplierForm from './components/SupplierForm';
import ScreeningModal from './components/ScreeningModal';
import {
    Container, AppBar, Toolbar, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, Paper, IconButton, TablePagination, Modal, Box, Alert, Link, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete, Search, Logout } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente principal de la aplicación
const App = () => {
    // Estados para gestionar proveedores, filtros, ordenamiento, paginación y autenticación
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showScreening, setShowScreening] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('lastEdited');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Verifica autenticación al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchSuppliers();
        }
    }, []);

    // Obtiene la lista de proveedores desde el backend
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:5207/api/suppliers');
            const sortedSuppliers = response.data.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
            setSuppliers(sortedSuppliers);
            setFilteredSuppliers(sortedSuppliers);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            if (error.response && error.response.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                setShowLoginModal(true);
            }
        }
    };

    // Maneja la creación o actualización de un proveedor
    const handleSave = async (supplier) => {
        try {
            if (supplier.id) {
                await axios.put(`http://localhost:5207/api/suppliers/${supplier.id}`, supplier);
                toast.success('Proveedor actualizado exitosamente');
            } else {
                console.log('Enviando solicitud POST con datos:', supplier);
                const response = await axios.post('http://localhost:5207/api/suppliers', supplier);
                console.log('Respuesta del servidor:', response);
                toast.success('Proveedor creado exitosamente');
            }
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            console.error('Detalles del error:', error.response?.data);
            toast.error(`Error al guardar el proveedor: ${error.response?.data?.message || error.message}`);
            if (error.response && error.response.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                setShowLoginModal(true);
            }
        }
    };

    // Inicia el proceso de eliminación de un proveedor
    const handleDelete = (id) => {
        const supplier = suppliers.find(s => s.id === id);
        setSupplierToDelete(supplier);
        setShowDeleteModal(true);
    };

    // Confirma la eliminación de un proveedor
    const confirmDelete = async () => {
        if (supplierToDelete) {
            try {
                await axios.delete(`http://localhost:5207/api/suppliers/${supplierToDelete.id}`);
                toast.success('Proveedor eliminado exitosamente');
                fetchSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                toast.error('Error al eliminar el proveedor');
                if (error.response && error.response.status === 401) {
                    setIsAuthenticated(false);
                    localStorage.removeItem('token');
                    setShowLoginModal(true);
                }
            }
        }
        setShowDeleteModal(false);
        setSupplierToDelete(null);
    };

    // Abre el formulario para editar un proveedor
    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setShowForm(true);
    };

    // Abre el modal de screening para un proveedor
    const handleScreening = (supplier) => {
        setSelectedSupplier(supplier);
        setShowScreening(true);
    };

    // Filtra proveedores según el término de búsqueda
    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = suppliers.filter((supplier) =>
            supplier.legalName.toLowerCase().includes(term) ||
            supplier.commercialName.toLowerCase().includes(term) ||
            supplier.country.toLowerCase().includes(term)
        );
        setFilteredSuppliers(filtered);
        setPage(0);
    };

    // Ordena la tabla según el campo seleccionado
    const handleSort = (field) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);

        const sorted = [...filteredSuppliers].sort((a, b) => {
            if (field === 'lastEdited') {
                return newOrder === 'asc'
                    ? new Date(a.lastEdited) - new Date(b.lastEdited)
                    : new Date(b.lastEdited) - new Date(a.lastEdited);
            }
            return newOrder === 'asc'
                ? a[field].localeCompare(b[field])
                : b[field].localeCompare(a[field]);
        });
        setFilteredSuppliers(sorted);
    };

    // Maneja el cambio de página en la paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Maneja el cambio de filas por página en la paginación
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Maneja el inicio de sesión del usuario
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5207/api/auth/login', {
                username,
                password
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            setShowLoginModal(false);
            setLoginError('');
            fetchSuppliers();
        } catch (error) {
            console.error('Error logging in:', error);
            setLoginError('Usuario o contraseña incorrectos.');
        }
    };

    // Maneja el cierre de sesión del usuario
    const handleLogout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setShowLoginModal(true);
        setSuppliers([]);
        setFilteredSuppliers([]);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Barra de navegación superior */}
            <AppBar position="fixed" sx={{ bgcolor: '#000000' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: '#FFC107' }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            height="40"
                            style={{ marginRight: '10px', verticalAlign: 'middle' }}
                        />
                        Debida Diligencia de Proveedores
                    </Typography>
                    <Button color="inherit" href="https://www.ey.com/es_pe" sx={{ color: '#FFFFFF' }}>Inicio</Button>
                    <Button color="inherit" href="https://www.ey.com/es_pe/about-us" sx={{ color: '#FFFFFF' }}>Sobre Nosotros</Button>
                    <Button color="inherit" href="https://www.ey.com/es_pe/about-us/connect-with-us" sx={{ color: '#FFFFFF' }}>Contáctanos</Button>
                    {isAuthenticated && (
                        <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ color: '#FFFFFF' }}>
                            Cerrar Sesión
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Modal de inicio de sesión */}
            <Modal open={showLoginModal} onClose={() => {}} BackdropProps={{ style: { backgroundColor: 'rgba(0,0,0,0.5)' } }}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Iniciar Sesión
                    </Typography>
                    <form onSubmit={handleLogin}>
                        <TextField
                            label="Usuario"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {loginError && <Alert severity="error" sx={{ mt: 2 }}>{loginError}</Alert>}
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Iniciar Sesión
                        </Button>
                    </form>
                </Box>
            </Modal>

            {/* Modal de confirmación para eliminar proveedor */}
            <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <DialogTitle sx={{ bgcolor: '#FFC107', color: '#000000' }}>
                    Confirmar Eliminación
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 2 }}>
                        ¿Estás seguro de que deseas eliminar el proveedor "{supplierToDelete?.legalName}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteModal(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={confirmDelete} color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Contenido principal (visible solo si el usuario está autenticado) */}
            {isAuthenticated && (
                <Container sx={{ mt: 10, mb: 5 }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Gestión de Proveedores
                    </Typography>
                    <TextField
                        label="Buscar por razón social, nombre comercial o país"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Add />}
                        onClick={() => { setSelectedSupplier(null); setShowForm(true); }}
                        sx={{ mb: 2 }}
                    >
                        Crear Proveedor
                    </Button>
                    {filteredSuppliers.length === 0 ? (
                        <Alert severity="info">No se encontraron proveedores.</Alert>
                    ) : (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#333333' }}>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'legalName'}
                                                    direction={sortField === 'legalName' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('legalName')}
                                                    sx={{ color: '#FFFFFF', '&:hover': { color: '#FFFFFF' }, '&.Mui-active': { color: '#FFFFFF' } }}
                                                >
                                                    Razón Social
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'commercialName'}
                                                    direction={sortField === 'commercialName' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('commercialName')}
                                                    sx={{ color: '#FFFFFF', '&:hover': { color: '#FFFFFF' }, '&.Mui-active': { color: '#FFFFFF' } }}
                                                >
                                                    Nombre Comercial
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Identificación Tributaria
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Correo Electrónico
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'country'}
                                                    direction={sortField === 'country' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('country')}
                                                    sx={{ color: '#FFFFFF', '&:hover': { color: '#FFFFFF' }, '&.Mui-active': { color: '#FFFFFF' } }}
                                                >
                                                    País
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Sitio Web
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Dirección Física
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Facturación Anual (USD)
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'lastEdited'}
                                                    direction={sortField === 'lastEdited' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('lastEdited')}
                                                    sx={{ color: '#FFFFFF', '&:hover': { color: '#FFFFFF' }, '&.Mui-active': { color: '#FFFFFF' } }}
                                                >
                                                    Última Edición
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                Acciones
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredSuppliers
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((supplier) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell>{supplier.legalName}</TableCell>
                                                    <TableCell>{supplier.commercialName}</TableCell>
                                                    <TableCell>{supplier.taxId}</TableCell>
                                                    <TableCell>{supplier.email}</TableCell>
                                                    <TableCell>{supplier.country}</TableCell>
                                                    <TableCell>
                                                        {supplier.website ? (
                                                            <Link
                                                                href={supplier.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                sx={{ color: '#000000', textDecoration: 'underline' }}
                                                            >
                                                                {supplier.website}
                                                            </Link>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{supplier.physicalAddress}</TableCell>
                                                    <TableCell>${supplier.annualBillingUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell>{new Date(supplier.lastEdited).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary" onClick={() => handleEdit(supplier)}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton color="error" onClick={() => handleDelete(supplier.id)}>
                                                            <Delete />
                                                        </IconButton>
                                                        <IconButton color="warning" onClick={() => handleScreening(supplier)}>
                                                            <Search />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredSuppliers.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}

                    <SupplierForm
                        show={showForm}
                        onHide={() => setShowForm(false)}
                        onSave={handleSave}
                        supplier={selectedSupplier}
                    />
                    <ScreeningModal
                        show={showScreening}
                        onHide={() => setShowScreening(false)}
                        supplier={selectedSupplier}
                    />
                </Container>
            )}

            {/* Pie de página */}
            <Box sx={{ bgcolor: '#000000', color: '#FFFFFF', py: 2, mt: 'auto', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                    © 2025 EY Perú. Todos los derechos reservados.
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                    Contacto: <Link href="mailto:info@EY.test.com" sx={{ color: '#FFFFFF', textDecoration: 'underline' }}>leonardo.dev@EY.test.com.pe</Link>
                </Typography>
            </Box>

            {/* Contenedor para notificaciones */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default App;