@echo off
cd /d "%~dp0backend"
start /min "" node app.js
timeout /t 3 /nobreak >nul
start http://localhost:5000
