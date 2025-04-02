using Microsoft.EntityFrameworkCore;
using SupplierApi.Data;
using SupplierApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Inicializa el constructor de la aplicación ASP.NET Core
var builder = WebApplication.CreateBuilder(args);

// Habilita controladores para manejar solicitudes API
builder.Services.AddControllers();

// Configura Entity Framework Core con SQL Server para la persistencia de datos
builder.Services.AddDbContext<SupplierDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registra HttpClient para realizar solicitudes HTTP externas
builder.Services.AddHttpClient();

// Configura CORS para permitir solicitudes desde el frontend (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Configura autenticación JWT para proteger los endpoints
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "SupplierApi",
        ValidAudience = "SupplierApiClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKey1234567890ThisIsLongEnough"))
    };
});

// Habilita autorización para endpoints protegidos
builder.Services.AddAuthorization();

// Configura Swagger para documentación de la API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Construye la aplicación
var app = builder.Build();

// Inserta un usuario de prueba en la base de datos si no existe
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SupplierDbContext>();
    if (!context.Users.Any())
    {
        context.Users.Add(new User { Username = "admin", Password = "password123" });
        context.SaveChanges();
    }
}

// Configura el pipeline de solicitudes
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Deshabilitado para desarrollo local
app.UseCors("AllowReactApp"); 
app.UseAuthentication();      
app.UseAuthorization();       
app.MapControllers();         

app.Run();