
Este repositorio contiene tres proyectos relacionados con la diligencia y gestión de proveedores de riesgo, cada uno tiene sus propias instrucciones (README.md):

- **web-scraping-backend**: API REST para realizar web scraping en listas de alto riesgo (Offshore Leaks, World Bank, OFAC).
- **supplier-api-backend**: API REST para gestionar proveedores y realizar screening contra listas de alto riesgo.
- **supplier-frontend**: Aplicación SPA en React para la gestión de proveedores y visualización de resultados de screening.

## Instrucciones de instalación

### Web Scraping Backend
1. Navega a la carpeta `web-scraping-backend`.
2. Ejecuta `dotnet restore` para restaurar las dependencias.
3. Configura las variables de entorno necesarias (como la API Key).
4. Ejecuta `dotnet run` para iniciar el servidor.

### Supplier API Backend
1. Navega a la carpeta `supplier-api-backend`.
2. Ejecuta `dotnet restore` para restaurar las dependencias.
3. Configura la cadena de conexión a SQL Server en `appsettings.json`.
4. Ejecuta `dotnet ef database update` para aplicar las migraciones.
5. Ejecuta `dotnet run` para iniciar el servidor.

### Supplier Frontend
1. Navega a la carpeta `supplier-frontend`.
2. Ejecuta `npm install` para instalar las dependencias.
3. Ejecuta `npm start` para iniciar la aplicación React.

## Uso
- Inicia sesión en la aplicación frontend con las credenciales predeterminadas (admin/password123).
- Gestiona proveedores y realiza screening contra las listas de alto riesgo.
