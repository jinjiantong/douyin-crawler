import sys
import os

# 设置Node.js环境
os.environ['NODE_PATH'] = r'C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs'
os.environ['PATH'] = os.environ['NODE_PATH'] + ';' + os.environ.get('PATH', '')

# 直接导入并运行uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from importlib import import_module

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
services = ['douyin']
for service in services:
    try:
        module = import_module(f'service.{service}.urls')
        app.include_router(getattr(module, 'router'))
        print(f"✓ Registered {service} router")
    except Exception as e:
        print(f"✗ Failed to register {service}: {e}")

# 运行
if __name__ == '__main__':
    import uvicorn
    print("Starting server on http://0.0.0.0:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080)
