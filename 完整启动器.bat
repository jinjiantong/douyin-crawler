@echo off
chcp 65001 >nul
echo ========================================
echo  抖音信息采集系统 - 完整启动器
echo ========================================
echo.

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python
    pause
    exit /b 1
)

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    pause
    exit /b 1
)

:: 显示菜单
echo 请选择启动模式：
echo.
echo   1. 启动所有服务（推荐）
echo   2. 仅启动后端服务
echo   3. 仅启动前端网站
echo   4. 启动 Cookie 自动获取工具
echo   5. 退出
echo.

set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" goto all
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto frontend
if "%choice%"=="4" goto cookie
if "%choice%"=="5" exit

echo [错误] 无效选项
pause
exit /b 1

:all
echo.
echo ========================================
echo  启动所有服务
echo ========================================
echo.

:: 启动后端
echo [1/3] 正在启动后端服务...
start "Crawler后端" cmd /k "cd /d %~dp0Crawler-main && .\venv\Scripts\python.exe main.py"

:: 等待后端启动
timeout /t 5 /nobreak >nul

:: 启动前端
echo [2/3] 正在启动前端服务...
start "抖音采集前端" cmd /k "cd /d %~dp0douyin-crawler-frontend && npm run dev"

:: 等待前端启动
timeout /t 3 /nobreak >nul

:: 打开浏览器
echo [3/3] 正在打开浏览器...
start http://localhost:3000

echo.
echo ========================================
echo  ✅ 所有服务已启动！
echo ========================================
echo.
echo 服务地址：
echo   - 前端网站: http://localhost:3000
echo   - 后端API: http://localhost:8080
echo.
echo 提示：
echo   - 关闭此窗口不会停止服务
echo   - 如需停止，请关闭对应的命令行窗口
echo   - 按任意键打开浏览器...
echo.
pause
start http://localhost:3000
exit

:backend
echo.
echo ========================================
echo  启动后端服务
echo ========================================
echo.
cd /d %~dp0Crawler-main
echo 正在启动后端服务（http://localhost:8080）...
echo.
.\venv\Scripts\python.exe main.py
pause
exit

:frontend
echo.
echo ========================================
echo  启动前端服务
echo ========================================
echo.
cd /d %~dp0douyin-crawler-frontend

:: 检查并安装依赖
if not exist "node_modules" (
    echo [提示] 正在安装依赖...
    npm install
)

echo 正在启动前端服务（http://localhost:3000）...
echo.
npm run dev
pause
exit

:cookie
echo.
echo ========================================
echo  启动 Cookie 自动获取工具
echo ========================================
echo.
echo 提示：此工具会自动打开浏览器
echo 请在浏览器中完成抖音登录
echo.
cd /d %~dp0douyin-crawler-frontend\backend
python douyin_cookie_fetcher.py
pause
exit
