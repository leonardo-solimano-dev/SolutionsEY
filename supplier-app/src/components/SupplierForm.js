import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography } from '@mui/material';

// Componente para el formulario de creación o edición de proveedores
const SupplierForm = ({ show, onHide, onSave, supplier }) => {
    // Estado para los datos del formulario y errores de validación
    const [formData, setFormData] = useState({
        id: null,
        legalName: '',
        commercialName: '',
        taxId: '',
        phoneNumber: '',
        email: '',
        website: '',
        physicalAddress: '',
        country: '',
        annualBillingUSD: 0
    });
    const [errors, setErrors] = useState({});

    // Actualiza los datos del formulario cuando se selecciona un proveedor para editar
    useEffect(() => {
        if (supplier) {
            setFormData({
                id: supplier.id,
                legalName: supplier.legalName || '',
                commercialName: supplier.commercialName || '',
                taxId: supplier.taxId || '',
                phoneNumber: supplier.phoneNumber || '',
                email: supplier.email || '',
                website: supplier.website || '',
                physicalAddress: supplier.physicalAddress || '',
                country: supplier.country || '',
                annualBillingUSD: supplier.annualBillingUSD || 0
            });
        } else {
            setFormData({
                id: null,
                legalName: '',
                commercialName: '',
                taxId: '',
                phoneNumber: '',
                email: '',
                website: '',
                physicalAddress: '',
                country: '',
                annualBillingUSD: 0
            });
        }
    }, [supplier]);

    // Valida los datos del formulario antes de enviarlos
    const validateForm = () => {
        const newErrors = {};
        if (!formData.legalName) newErrors.legalName = 'La razón social es obligatoria.';
        if (!formData.commercialName) newErrors.commercialName = 'El nombre comercial es obligatorio.';
        if (!formData.taxId || formData.taxId.length !== 11 || !/^\d{11}$/.test(formData.taxId))
            newErrors.taxId = 'La identificación tributaria debe tener 11 dígitos numéricos.';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'El número telefónico es obligatorio.';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'El correo electrónico debe ser válido.';
        if (!formData.physicalAddress) newErrors.physicalAddress = 'La dirección física es obligatoria.';
        if (!formData.country) newErrors.country = 'El país es obligatorio.';
        if (formData.annualBillingUSD < 0) newErrors.annualBillingUSD = 'La facturación anual no puede ser negativa.';

        if (formData.website) {
            const urlRegex = /^(https?:\/\/)[\w-]+(\.[\w-]+)+([\w-./?%&=]*)?$/;
            if (!urlRegex.test(formData.website)) {
                newErrors.website = 'El sitio web debe ser una URL válida (e.g., https://sitio.com).';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'annualBillingUSD' ? parseFloat(value) || 0 : value;
        setFormData({ ...formData, [name]: newValue });
    };

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = {
                ...formData,
                annualBillingUSD: parseFloat(formData.annualBillingUSD) || 0
            };
            if (dataToSubmit.id === null) {
                delete dataToSubmit.id;
            }
            onSave(dataToSubmit);
            onHide();
        }
    };

    return (
        <Dialog open={show} onClose={onHide}>
            <DialogTitle sx={{ bgcolor: '#FFC107', color: '#000000' }}>
                {supplier ? 'Editar Proveedor' : 'Crear Proveedor'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Razón Social"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    error={!!errors.legalName}
                    helperText={errors.legalName}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Nombre Comercial"
                    name="commercialName"
                    value={formData.commercialName}
                    onChange={handleChange}
                    error={!!errors.commercialName}
                    helperText={errors.commercialName}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Identificación Tributaria"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    error={!!errors.taxId}
                    helperText={errors.taxId}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Número Telefónico"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Sitio Web (Opcional)"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    error={!!errors.website}
                    helperText={errors.website}
                    placeholder="Ejemplo: https://sitio.com"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Dirección Física"
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                    error={!!errors.physicalAddress}
                    helperText={errors.physicalAddress}
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>País</InputLabel>
                    <Select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        error={!!errors.country}
                    >
                        <MenuItem value="">Seleccione un país</MenuItem>
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="Canada">Canada</MenuItem>
                        <MenuItem value="Mexico">Mexico</MenuItem>
                        <MenuItem value="Brazil">Brazil</MenuItem>
                        <MenuItem value="India">India</MenuItem>
                        <MenuItem value="China">China</MenuItem>
                    </Select>
                    {errors.country && <Typography color="error" variant="caption">{errors.country}</Typography>}
                </FormControl>
                <TextField
                    label="Facturación Anual (USD)"
                    name="annualBillingUSD"
                    type="number"
                    value={formData.annualBillingUSD}
                    onChange={handleChange}
                    error={!!errors.annualBillingUSD}
                    helperText={errors.annualBillingUSD}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onHide} color="secondary">Cancelar</Button>
                <Button onClick={handleSubmit} color="primary">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupplierForm;