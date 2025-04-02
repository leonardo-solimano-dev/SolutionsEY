namespace WebScrapingAPI.Middleware
{
    public class ApiKeyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string? _apiKey;

        public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _apiKey = configuration["ApiKey"];
            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new InvalidOperationException("El 'ApiKey' no está configurado en appsettings.json.");
            }
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("Api-Key-EY", out var apiKey) || apiKey != _apiKey)
            {
                context.Response.StatusCode = 401; // Unauthorized
                await context.Response.WriteAsync("API Key inválida o no proporcionada.");
                return;
            }

            await _next(context);
        }
    }

    public static class ApiKeyMiddlewareExtensions
    {
        public static IApplicationBuilder UseApiKeyAuthentication(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ApiKeyMiddleware>();
        }
    }
}