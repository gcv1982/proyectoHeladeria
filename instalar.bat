@echo off
title Grido Laspiur - Instalacion
color 0B
echo.
echo  ==========================================
echo   GRIDO LASPIUR - Instalacion inicial
echo  ==========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
  color 0C
  echo  ERROR: Node.js no esta instalado.
  echo  Instala Node.js desde https://nodejs.org y volvé a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)
echo  [OK] Node.js encontrado.

:: Instalar dependencias del backend
echo.
echo  Instalando dependencias del servidor...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
  color 0C
  echo  ERROR al instalar dependencias del backend.
  pause
  exit /b 1
)
echo  [OK] Backend listo.

:: Construir el frontend
echo.
echo  Instalando y construyendo el frontend (puede tardar unos minutos)...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
  color 0C
  echo  ERROR al instalar dependencias del frontend.
  pause
  exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
  color 0C
  echo  ERROR al construir el frontend.
  pause
  exit /b 1
)
echo  [OK] Frontend construido.

:: Migrar base de datos (tablas + productos)
echo.
echo  Creando tablas e importando productos...
cd /d "%~dp0backend"
call node migrate-productos.js
if %errorlevel% neq 0 (
  color 0C
  echo  ERROR al migrar la base de datos.
  pause
  exit /b 1
)
echo  [OK] Base de datos lista.

:: Verificar .env
echo.
if not exist "%~dp0backend\.env" (
  color 0E
  echo  ATENCION: No se encontro el archivo .env en la carpeta backend.
  echo  Crea el archivo backend\.env con los datos de tu base de datos
  echo  antes de ejecutar iniciar.bat
  echo.
  echo  Ejemplo del contenido del archivo .env:
  echo    DB_HOST=localhost
  echo    DB_PORT=5432
  echo    DB_NAME=heladeria_db
  echo    DB_USER=postgres
  echo    DB_PASSWORD=tu_clave_postgres
  echo    JWT_SECRET=una_clave_larga_secreta_aqui
  echo    PORT=5000
  echo    NODE_ENV=production
  echo.
) else (
  echo  [OK] Archivo .env encontrado.
)

echo.
echo  ==========================================
echo   Instalacion completada.
echo   Usa iniciar.bat para arrancar el sistema.
echo  ==========================================
echo.
pause
