@echo off
cd /d %~dp0
cd Crawler-main
echo 正在启动后端服务...
.\venv\Scripts\python.exe main.py
pause
