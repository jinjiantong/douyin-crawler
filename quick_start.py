"""
快速启动脚本
一键启动所有服务
"""

import os
import sys
import subprocess
import webbrowser
import time

def print_banner():
    print("=" * 60)
    print("🎵 抖音信息采集系统 - 快速启动")
    print("=" * 60)
    print()

def check_requirements():
    """检查必要条件"""
    print("🔍 正在检查系统要求...")
    
    # 检查 Python
    try:
        result = subprocess.run(['python', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Python: {result.stdout.strip()}")
        else:
            print("❌ Python 未安装")
            return False
    except:
        print("❌ Python 未安装")
        return False
    
    # 检查 Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js: {result.stdout.strip()}")
        else:
            print("❌ Node.js 未安装")
            return False
    except:
        print("❌ Node.js 未安装")
        return False
    
    print()
    return True

def start_backend():
    """启动后端服务"""
    print("🚀 正在启动后端服务...")
    
    backend_dir = os.path.join(os.path.dirname(__file__), 'Crawler-main')
    if not os.path.exists(backend_dir):
        print(f"❌ 找不到后端目录: {backend_dir}")
        return None
    
    try:
        # 启动后端
        cmd = f'cd /d "{backend_dir}" && .\\venv\\Scripts\\python.exe main.py'
        process = subprocess.Popen(cmd, shell=True)
        print(f"✅ 后端服务已启动 (PID: {process.pid})")
        return process
    except Exception as e:
        print(f"❌ 后端启动失败: {str(e)}")
        return None

def start_frontend():
    """启动前端服务"""
    print("🚀 正在启动前端服务...")
    
    frontend_dir = os.path.join(os.path.dirname(__file__), 'douyin-crawler-frontend')
    if not os.path.exists(frontend_dir):
        print(f"❌ 找不到前端目录: {frontend_dir}")
        return None
    
    try:
        # 安装依赖
        if not os.path.exists(os.path.join(frontend_dir, 'node_modules')):
            print("📦 正在安装前端依赖...")
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
        
        # 启动前端
        cmd = f'cd /d "{frontend_dir}" && npm run dev'
        process = subprocess.Popen(cmd, shell=True)
        print(f"✅ 前端服务已启动 (PID: {process.pid})")
        return process
    except Exception as e:
        print(f"❌ 前端启动失败: {str(e)}")
        return None

def main():
    print_banner()
    
    if not check_requirements():
        input("\n按 Enter 键退出...")
        sys.exit(1)
    
    print("🎯 准备启动服务...")
    print()
    
    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        input("\n后端启动失败，按 Enter 键退出...")
        sys.exit(1)
    
    # 等待后端启动
    print("⏳ 等待后端服务就绪...")
    time.sleep(3)
    
    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        input("\n前端启动失败，按 Enter 键退出...")
        sys.exit(1)
    
    # 等待前端启动
    print("⏳ 等待前端服务就绪...")
    time.sleep(5)
    
    # 打开浏览器
    print("🌐 正在打开浏览器...")
    time.sleep(2)
    webbrowser.open('http://localhost:3000')
    
    print()
    print("=" * 60)
    print("✅ 所有服务已成功启动！")
    print("=" * 60)
    print()
    print("📍 访问地址：")
    print("   - 前端网站: http://localhost:3000")
    print("   - 后端API: http://localhost:8080")
    print()
    print("💡 提示：")
    print("   - 关闭窗口不会停止服务")
    print("   - 如需停止，请关闭对应的命令行窗口")
    print()
    print("按 Ctrl+C 可以停止所有服务")
    print()
    
    try:
        # 保持运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 正在停止服务...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("✅ 服务已停止")
        input("\n按 Enter 键退出...")

if __name__ == "__main__":
    main()
