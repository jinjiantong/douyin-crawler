"""
抖音 Cookie 获取 API
提供 HTTP 接口给前端调用 Selenium 自动化脚本
"""

from flask import Blueprint, jsonify, request
import subprocess
import time
import os
import json
import threading

cookie_bp = Blueprint('cookie', __name__, url_prefix='/cookie')

正在运行 = False

@cookie_bp.route('/fetch', methods=['POST'])
def fetch_cookie():
    """
    触发 Cookie 获取流程
    使用 Selenium 打开浏览器让用户登录
    """
    global 正在运行
    
    if 正在运行:
        return jsonify({
            'code': 1,
            'msg': '已有获取任务正在运行，请稍后再试',
            'data': None
        }), 400
    
    正在运行 = True
    
    try:
        # 在后台线程中运行 Selenium 脚本
        def run_fetcher():
            try:
                script_path = os.path.join(
                    os.path.dirname(__file__), 
                    'douyin_cookie_fetcher.py'
                )
                
                # 运行 Selenium 脚本
                result = subprocess.run(
                    ['python', script_path],
                    capture_output=True,
                    text=True,
                    timeout=360  # 6分钟超时
                )
                
                print(result.stdout)
                if result.stderr:
                    print(result.stderr)
                    
            except subprocess.TimeoutExpired:
                print("Cookie 获取超时")
            except Exception as e:
                print(f"运行出错: {str(e)}")
            finally:
                global 正在运行
                正在运行 = False
        
        # 启动后台线程
        thread = threading.Thread(target=run_fetcher)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'code': 0,
            'msg': '已启动浏览器，请在弹出的窗口中完成抖音登录',
            'data': {
                'status': 'running',
                'tip': '登录成功后，Cookie 将自动保存到文件'
            }
        })
        
    except Exception as e:
        正在运行 = False
        return jsonify({
            'code': 1,
            'msg': f'启动失败: {str(e)}',
            'data': None
        }), 500

@cookie_bp.route('/check', methods=['GET'])
def check_cookie():
    """
    检查是否有新获取的 Cookie
    """
    try:
        cookie_file = os.path.join(
            os.path.dirname(__file__), 
            'douyin_cookie_temp.txt'
        )
        
        if os.path.exists(cookie_file):
            # 读取 Cookie
            with open(cookie_file, 'r', encoding='utf-8') as f:
                cookie_content = f.read().strip()
            
            if cookie_content:
                # 删除临时文件
                os.remove(cookie_file)
                
                return jsonify({
                    'code': 0,
                    'msg': '找到新 Cookie',
                    'data': {
                        'cookie': cookie_content,
                        'length': len(cookie_content)
                    }
                })
        
        return jsonify({
            'code': 0,
            'msg': '暂无新 Cookie',
            'data': None
        })
        
    except Exception as e:
        return jsonify({
            'code': 1,
            'msg': f'检查失败: {str(e)}',
            'data': None
        }), 500

@cookie_bp.route('/status', methods=['GET'])
def get_status():
    """
    获取当前获取状态
    """
    global 正在运行
    
    return jsonify({
        'code': 0,
        'msg': 'success',
        'data': {
            'running': 正在运行,
            'message': '正在获取 Cookie...' if 正在运行 else '空闲'
        }
    })

@cookie_bp.route('/cancel', methods=['POST'])
def cancel_fetch():
    """
    取消获取任务
    """
    global 正在运行
    
    if 正在运行:
        正在运行 = False
        return jsonify({
            'code': 0,
            'msg': '已取消获取任务',
            'data': None
        })
    else:
        return jsonify({
            'code': 1,
            'msg': '没有正在运行的获取任务',
            'data': None
        })
