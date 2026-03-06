#!/bin/bash

echo "===================================="
echo "BACKEND - Sistema de Heladería"
echo "===================================="
echo ""

echo "[1/3] Verificando Python..."
python3 --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python no está instalado"
    exit 1
fi

echo ""
echo "[2/3] Instalando dependencias..."
pip3 install -r requirements.txt

echo ""
echo "[3/3] Iniciando servidor..."
echo ""
echo "Servidor disponible en: http://localhost:8000"
echo "Documentación en: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

uvicorn app.main:app --reload
