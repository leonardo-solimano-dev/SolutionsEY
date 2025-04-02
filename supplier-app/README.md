# SupplierDiligenceManagement (Frontend)

## Descripción
Este proyecto es una SPA construida con React Javascript y Bootstrap, que permite gestionar a los proveedores y realizar screening contra listas de alto riesgo  (Offshore Leaks, World Bank, OFAC). Se comunica con `SupplierApi` (backend) para gestionar los proveedores y mostrar los resultados del screening.

## Requisitos
- Node.js (v16 o superior)

## Instrucciones de instalación

### 1. Instalar dependencias

1. Navega a la carpeta del proyecto: 
    cd supplier-app

2. Instalar las dependencias: 
    npm install

3. Ejecutar el proyecto (La aplicación estará disponible en http://localhost:3000): 
    npm start

4. Inicia sesión con las autenticación implementada con JWT:
#### Usuario: admin
#### Contraseña: password123

## Instrucciones de Ejecución

1. Abrir la aplicación en el navegador (http://localhost:3000).

2. Usa el botón "Crear Proveedor" para añadir nuevos proveedores.

3. En la tabla, puedes editar, eliminar, o realizar un screening de cada proveedor.

4. El screening abre un modal donde puedes seleccionar una fuente (Offshore Leaks, World Bank, OFAC) y ver los resultados.

5. Este proyecto depende de SupplierApi para funcionar. Dicho proyecto se ejecuta en el puerto http://localhost:5207, ejecutarlo antes de iniciar este proyecto (frontend).

## Dependencias

1. React: Framework para construir la SPA.
2. Material-UI: Para el diseño y los componentes UI.
3. Axios: Para realizar solicitudes HTTP al backend (SupplierApiManagement).

