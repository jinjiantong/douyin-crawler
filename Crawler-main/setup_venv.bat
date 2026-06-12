@echo off
cd /d "%~dp0"
echo Creating virtual environment...
"C:\Users\Lenovo\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\vm\tools\node\node.exe" -m venv venv
echo.
echo Installing dependencies (this may take a few minutes)...
call venv\Scripts\python.exe -m pip install -r requirements-windows.txt
echo.
echo Creating Node.js runtime configuration...
echo set NODE_PATH=C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs >> set_env.bat
echo.
echo Setup complete! To start the server, run: start_server.bat
pause
