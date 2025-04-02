using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplierApi.Data;
using SupplierApi.Models;

namespace SupplierApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly SupplierDbContext _context;
        private readonly HttpClient _httpClient;

        // Constructor: inicializa el contexto de la base de datos y HttpClient
        public SuppliersController(SupplierDbContext context, HttpClient httpClient)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _httpClient.DefaultRequestHeaders.Add("Api-Key-EY", "EY-PasswordApi123"); // API Key para el servicio de scraping
        }

        // GET: api/suppliers - Obtiene la lista de proveedores ordenada por fecha de última edición
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierModel>>> GetSuppliers()
        {
            return await _context.Suppliers
                .OrderByDescending(s => s.LastEdited)
                .ToListAsync();
        }

        // GET: api/suppliers/{id} - Obtiene un proveedor específico por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierModel>> GetSupplier(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound("Proveedor no encontrado.");
            }
            return supplier;
        }

        // POST: api/suppliers - Crea un nuevo proveedor con validaciones
        [HttpPost]
        public async Task<ActionResult<SupplierModel>> CreateSupplier(SupplierModel supplier)
        {
            // Validaciones de los campos del proveedor
            if (string.IsNullOrEmpty(supplier.LegalName) || supplier.LegalName.Length > 255)
                return BadRequest("La razón social es obligatoria y debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.CommercialName) || supplier.CommercialName.Length > 255)
                return BadRequest("El nombre comercial es obligatorio y debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.TaxId) || supplier.TaxId.Length != 11 || !supplier.TaxId.All(char.IsDigit))
                return BadRequest("La identificación tributaria es obligatoria, debe tener 11 dígitos y ser numérica.");
            if (string.IsNullOrEmpty(supplier.PhoneNumber) || supplier.PhoneNumber.Length > 20)
                return BadRequest("El número telefónico es obligatorio y debe tener máximo 20 caracteres.");
            if (string.IsNullOrEmpty(supplier.Email) || supplier.Email.Length > 255 || !supplier.Email.Contains("@"))
                return BadRequest("El correo electrónico es obligatorio, debe tener máximo 255 caracteres y ser válido.");
            if (!string.IsNullOrEmpty(supplier.Website) && supplier.Website.Length > 255)
                return BadRequest("El sitio web debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.PhysicalAddress) || supplier.PhysicalAddress.Length > 500)
                return BadRequest("La dirección física es obligatoria y debe tener máximo 500 caracteres.");
            if (string.IsNullOrEmpty(supplier.Country) || supplier.Country.Length > 100)
                return BadRequest("El país es obligatorio y debe tener máximo 100 caracteres.");
            if (supplier.AnnualBillingUSD < 0)
                return BadRequest("La facturación anual no puede ser negativa.");

            supplier.LastEdited = DateTime.UtcNow;
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
        }

        // PUT: api/suppliers/{id} - Actualiza un proveedor existente con validaciones
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, SupplierModel supplier)
        {
            if (id != supplier.Id)
            {
                return BadRequest("El ID del proveedor no coincide.");
            }

            var existingSupplier = await _context.Suppliers.FindAsync(id);
            if (existingSupplier == null)
            {
                return NotFound("Proveedor no encontrado.");
            }

            // Validaciones (igual que en Create)
            if (string.IsNullOrEmpty(supplier.LegalName) || supplier.LegalName.Length > 255)
                return BadRequest("La razón social es obligatoria y debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.CommercialName) || supplier.CommercialName.Length > 255)
                return BadRequest("El nombre comercial es obligatorio y debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.TaxId) || supplier.TaxId.Length != 11 || !supplier.TaxId.All(char.IsDigit))
                return BadRequest("La identificación tributaria es obligatoria, debe tener 11 dígitos y ser numérica.");
            if (string.IsNullOrEmpty(supplier.PhoneNumber) || supplier.PhoneNumber.Length > 20)
                return BadRequest("El número telefónico es obligatorio y debe tener máximo 20 caracteres.");
            if (string.IsNullOrEmpty(supplier.Email) || supplier.Email.Length > 255 || !supplier.Email.Contains("@"))
                return BadRequest("El correo electrónico es obligatorio, debe tener máximo 255 caracteres y ser válido.");
            if (!string.IsNullOrEmpty(supplier.Website) && supplier.Website.Length > 255)
                return BadRequest("El sitio web debe tener máximo 255 caracteres.");
            if (string.IsNullOrEmpty(supplier.PhysicalAddress) || supplier.PhysicalAddress.Length > 500)
                return BadRequest("La dirección física es obligatoria y debe tener máximo 500 caracteres.");
            if (string.IsNullOrEmpty(supplier.Country) || supplier.Country.Length > 100)
                return BadRequest("El país es obligatorio y debe tener máximo 100 caracteres.");
            if (supplier.AnnualBillingUSD < 0)
                return BadRequest("La facturación anual no puede ser negativa.");

            // Actualiza los campos del proveedor existente
            existingSupplier.LegalName = supplier.LegalName;
            existingSupplier.CommercialName = supplier.CommercialName;
            existingSupplier.TaxId = supplier.TaxId;
            existingSupplier.PhoneNumber = supplier.PhoneNumber;
            existingSupplier.Email = supplier.Email;
            existingSupplier.Website = supplier.Website;
            existingSupplier.PhysicalAddress = supplier.PhysicalAddress;
            existingSupplier.Country = supplier.Country;
            existingSupplier.AnnualBillingUSD = supplier.AnnualBillingUSD;
            existingSupplier.LastEdited = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Suppliers.Any(e => e.Id == id))
                {
                    return NotFound("Proveedor no encontrado.");
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/suppliers/{id} - Elimina un proveedor por ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound("Proveedor no encontrado.");
            }

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/suppliers/{id}/screening - Realiza screening de un proveedor contra listas de alto riesgo
        [HttpGet("{id}/screening")]
        public async Task<IActionResult> GetScreening(int id, [FromQuery] string source)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound("Proveedor no encontrado.");
            }

            if (string.IsNullOrEmpty(source) || !new[] { "offshore", "worldbank", "ofac" }.Contains(source))
            {
                return BadRequest("Fuente inválida. Use 'offshore', 'worldbank' o 'ofac'.");
            }

            try
            {
                var response = await _httpClient.GetAsync($"http://localhost:5126/api/scraping/scrape?entityName={Uri.EscapeDataString(supplier.LegalName)}&source={source}");
                response.EnsureSuccessStatusCode();
                var content = await response.Content.ReadAsStringAsync();
                return Ok(content); // Retorna el resultado del API de scraping
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al realizar el screening: {ex.Message}");
            }
        }
    }
}