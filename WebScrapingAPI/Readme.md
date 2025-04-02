# WebScrapingAPI

## Descripción
Este proyecto es un REST API que realiza web scraping y consumo de APIs para buscar entidades en listas de alto riesgo (Offshore Leaks, World Bank, OFAC).

## Requisitos
- .NET 6.0 SDK en adelante
- Postman (para probar la API)

## Instrucciones para Desplegar Localmente
1. **Clonar el Repositorio o Descomprimir el ZIP:**
   - Si usas GIT: `git clone https://github.com/tu-usuario/WebScrapingAPI.git`
   - Si usas ZIP: Descomprime `WebScrapingAPI.zip`.

2. **Restaurar Dependencias:**
   - Navega al directorio del proyecto: `cd WebScrapingAPI`
   - Ejecuta: `dotnet restore`

3. **Configurar el API Key:**
   - Abre `appsettings.json` y verifica que el `ApiKey` esté configurado:
     ```json
     "ApiKey": "EY-PasswordApi123"