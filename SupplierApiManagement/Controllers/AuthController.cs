using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SupplierApi.Data;
using SupplierApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SupplierApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SupplierDbContext _context;

        // Constructor: inicializa el contexto de la base de datos
        public AuthController(SupplierDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/login - Autentica un usuario y genera un token JWT
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest("El nombre de usuario y la contraseña son obligatorios.");
            }

            var user = _context.Users.FirstOrDefault(u => u.Username == model.Username && u.Password == model.Password);
            if (user == null)
            {
                return Unauthorized("Usuario o contraseña incorrectos.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Genera un token JWT para el usuario autenticado
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKey1234567890ThisIsLongEnough"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "SupplierApi",
                audience: "SupplierApiClient",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Modelo para los datos de inicio de sesión
    public class LoginModel
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}