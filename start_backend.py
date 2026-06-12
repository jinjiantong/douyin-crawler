"""
启动后端服务的脚本
"""
import os
import sys
import subprocess

def start_backend():
    """启动后端服务"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'Crawler-main')
    python_exe = os.path.join(backend_dir, 'venv', 'Scripts', 'python.exe')
    main_py = os.path.join(backend_dir, 'main.py')
    
    print(f"后端目录: {backend_dir}")
    print(f"Python: {python_exe}")
    print(f"主文件: {main_py}")
    print()
    
    if not os.path.exists(python_exe):
        print("❌ 找不到 Python 解释器")
        print(f"路径: {python_exe}")
        return False
    
    if not os.path.exists(main_py):
        print("❌ 找不到 main.py")
        print(f"路径: {main_py}")
        return False
    
    print("🚀 正在启动后端服务...")
    print()
    
    try:
        # 启动后端
        process = subprocess.Popen(
            [python_exe, main_py],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        
        print(f"✅ 后端服务已启动 (PID: {process.pid})")
        print()
        print("📍 访问地址: http://localhost:8080")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ 启动失败: {str(e)}")
        return False

if __name__ == "__main__":
    start_backend()
    input("\n按 Enter 键退出...")
