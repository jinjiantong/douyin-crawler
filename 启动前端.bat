@echo off
echo ========================================
echo  抖音信息采集网站启动器
echo ========================================
echo.

:: 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

:: 检查前端目录
if not exist "douyin-crawler-frontend" (
    echo [错误] 未找到 douyin-crawler-frontend 目录
    pause
    exit /b 1
)

:: 检查 Crawler 后端是否运行
echo [检查] 正在检查 Crawler 后端服务...
curl -s http://localhost:8080/douyin/account_list >nul 2>&1
if errorlevel 1 (
    echo [警告] Crawler 后端服务未运行
    echo [提示] 请先启动 Crawler 后端服务
    echo [提示] 在 Crawler-main 目录运行: .\venv\Scripts\python.exe main.py
    echo.
)

:: 安装前端依赖
echo.
echo [安装] 正在安装前端依赖...
cd douyin-crawler-frontend
call npm install

if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

:: 启动前端
echo.
echo [启动] 正在启动前端服务...
echo [提示] 访问 http://localhost:3000
echo [提示] 按 Ctrl+C 停止服务
echo.

call npm run dev

pause
