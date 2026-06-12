@echo off
set NODE_PATH=C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs
set PATH=%NODE_PATH%;%PATH%
cd /d "%~dp0"
echo Starting backend service on http://localhost:8080...
echo.
.\venv\Scripts\python.exe main.py
