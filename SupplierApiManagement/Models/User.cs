namespace SupplierApi.Models
{
    // Modelo para representar un usuario en la base de datos
    public class User
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; } // Hash en producción
    }
}