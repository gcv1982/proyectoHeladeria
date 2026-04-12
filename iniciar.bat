@echo off
title Grido Laspiur - Servidor
color 0A
echo.
echo  ==========================================
echo   GRIDO LASPIUR - Iniciando servidor...
echo  ==========================================
echo.

cd /d "%~dp0backend"

:: Verificar que existe el archivo .env
if not exist ".env" (
  color 0C
  echo  ERROR: No se encontro el archivo .env en la carpeta backend.
  echo  Por favor ejecuta primero instalar.bat
  echo.
  pause
  exit /b 1
)

:: Abrir el navegador luego de 3 segundos
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

echo  Servidor iniciado. Para cerrar, cerrá esta ventana.
echo.
node app.js

pause
