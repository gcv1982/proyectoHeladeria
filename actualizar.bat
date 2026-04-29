@echo off
echo ================================
echo   ACTUALIZANDO SISTEMA...
echo ================================
echo.
echo [1/2] Construyendo frontend...
cd C:\ProyectoProgramaHeladeria\frontend
call npm run build
echo.
echo [2/2] Iniciando servidor...
start http://localhost:5000
cd C:\ProyectoProgramaHeladeria\backend
node app.js
