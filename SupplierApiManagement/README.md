# SupplierApi (Backend)

## Descripción
Este proyecto es una API RESTful construida con ASP.NET Core que gestiona proveedores y permite realizar screening contra listas de alto riesgo. Se comunica con `WebScrapingAPI` para obtener los resultados del screening y almacena los datos de los proveedores en una base de datos SQL Server.

## Requisitos
- **.NET 7 SDK en adelante**
- **SQL Server** (para la base de datos)

## Instrucciones de instalación

### 1. Configurar la base de datos
1. Asegúrate de que SQL Server esté instalado y corriendo.
2. Abre el archivo `appsettings.json` y configura la cadena de conexión a tu base de datos:
   ```json
   "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SupplierDb;Trusted_Connection=True;"
   }
3. Reemplaza Server=localhost con el nombre de tu servidor SQL Server si es diferente.
4. Si usas autenticación de SQL Server en lugar de Trusted_Connection, ajusta la cadena de conexión (Ejemplo:User Id=tu_usuario;Password=tu_contraseña;).

## Instrucciones adicionales

1. Aplica las migraciones para crear la base de datos:
     dotnet ef database update

2. Navega a la carpeta del proyecto.
    cd SupplierApi

3. Restaura las dependencias: 
    dotnet restore

4. Ejecuta el proyecto: 
    dotnet run

5. El servidor estará disponible en http://localhost:5207.

6. Importante: Este proyecto depende de WebScrapingAPI para el screening. Hay que asegurarse que WebScrapingAPI esté corriendo en http://localhost:5126 antes de usar el endpoint de screening.

7. Endpoints:
GET /api/suppliers: Obtiene la lista de proveedores.
POST /api/suppliers: Crea un nuevo proveedor.
PUT /api/suppliers/{id}: Actualiza un proveedor existente.
DELETE /api/suppliers/{id}: Elimina un proveedor.

ejm:
GET /api/suppliers/{id}/screening?source={source}: Realiza el screening de un proveedor contra una fuente específica (offshore, worldbank, ofac).