@echo off
set PATH=%USERPROFILE%\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\vm\tools\node;%PATH%
cd /d "%~dp0"
echo Starting frontend service...
npm run dev
