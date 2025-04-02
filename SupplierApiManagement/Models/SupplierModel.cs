namespace SupplierApi.Models
{
    public class SupplierModel
    {
        public int Id { get; set; }
        public string LegalName { get; set; } = string.Empty; // Razón social
        public string CommercialName { get; set; } = string.Empty; // Nombre comercial
        public string TaxId { get; set; } = string.Empty; // Identificación tributaria (11 dígitos)
        public string PhoneNumber { get; set; } = string.Empty; // Número telefónico
        public string Email { get; set; } = string.Empty; // Correo electrónico
        public string? Website { get; set; } // Sitio web (opcional)
        public string PhysicalAddress { get; set; } = string.Empty; // Dirección física
        public string Country { get; set; } = string.Empty; // País
        public decimal AnnualBillingUSD { get; set; } // Facturación anual en dólares
        public DateTime LastEdited { get; set; } // Fecha de última edición
    }
}