@echo off
start "Servidor Heladeria" /d "%~dp0backend" node app.js
timeout /t 4 /nobreak >nul
start http://localhost:5000
