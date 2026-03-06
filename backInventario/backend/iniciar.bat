@echo off
echo ====================================
echo BACKEND - Sistema de Heladeria
echo ====================================
echo.

echo [1/3] Verificando Python...
python --version
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    pause
    exit
)

echo.
echo [2/3] Instalando dependencias...
pip install -r requirements.txt

echo.
echo [3/3] Iniciando servidor...
echo.
echo Servidor disponible en: http://localhost:8000
echo Documentacion en: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

uvicorn app.main:app --reload

pause
