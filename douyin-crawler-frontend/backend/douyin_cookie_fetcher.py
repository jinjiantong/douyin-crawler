"""
抖音 Cookie 自动获取工具
使用 Selenium 自动化登录并获取 Cookie
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json
import sys
import os

class DouyinCookieFetcher:
    def __init__(self):
        self.driver = None
        self.cookies = None
        
    def setup_driver(self):
        """设置 Chrome 驱动"""
        print("正在初始化浏览器...")
        
        options = uc.ChromeOptions()
        options.headless = False  # 显示浏览器窗口
        
        # 禁用自动化标识
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--no-sandbox')
        
        try:
            self.driver = uc.Chrome(options=options, version_main=None)
            print("浏览器初始化成功")
            return True
        except Exception as e:
            print(f"浏览器初始化失败: {str(e)}")
            return False
    
    def open_login_page(self):
        """打开抖音登录页面"""
        print("正在打开抖音登录页面...")
        
        try:
            # 打开抖音登录页面
            self.driver.get("https://www.douyin.com/login")
            
            # 等待页面加载
            time.sleep(2)
            
            print("已打开登录页面，请在浏览器中完成登录")
            print("提示：")
            print("1. 使用手机扫码登录（推荐）")
            print("2. 或使用账号密码登录")
            print("3. 登录成功后，系统将自动获取 Cookie")
            print("\n等待登录中...", flush=True)
            
            return True
            
        except Exception as e:
            print(f"打开登录页面失败: {str(e)}")
            return False
    
    def wait_for_login(self, timeout=300):
        """等待用户登录"""
        print(f"\n开始检测登录状态（超时时间: {timeout}秒）...")
        
        start_time = time.time()
        check_count = 0
        
        while time.time() - start_time < timeout:
            try:
                # 检查是否跳转到首页
                current_url = self.driver.current_url
                
                # 如果 URL 不再包含 login，说明可能已登录
                if "login" not in current_url.lower():
                    print(f"\n检测到 URL 变化: {current_url}")
                    
                    # 额外等待确保登录完成
                    time.sleep(3)
                    
                    # 再检查一次 URL
                    if "login" not in self.driver.current_url.lower():
                        print("✅ 检测到登录成功！")
                        return True
                
                check_count += 1
                if check_count % 10 == 0:
                    elapsed = int(time.time() - start_time)
                    print(f"\r已等待 {elapsed} 秒，仍在等待登录...", end='', flush=True)
                
                time.sleep(1)
                
            except Exception as e:
                print(f"\n检测登录状态时出错: {str(e)}")
                time.sleep(2)
        
        print(f"\n⏰ 等待超时（{timeout}秒）")
        return False
    
    def get_cookies(self):
        """获取 Cookie"""
        print("\n正在提取 Cookie...")
        
        try:
            # 获取所有 Cookie
            cookies = self.driver.get_cookies()
            
            # 转换为字符串格式
            cookie_str = "; ".join([
                f"{cookie['name']}={cookie['value']}" 
                for cookie in cookies
            ])
            
            self.cookies = cookie_str
            
            # 创建 Cookie 数据
            cookie_data = {
                "cookies": cookie_str,
                "cookies_list": cookies,
                "count": len(cookies),
                "url": self.driver.current_url
            }
            
            print(f"✅ 成功获取 {len(cookies)} 个 Cookie")
            print(f"Cookie 长度: {len(cookie_str)} 字符")
            
            return cookie_data
            
        except Exception as e:
            print(f"❌ 获取 Cookie 失败: {str(e)}")
            return None
    
    def save_to_file(self, cookie_data):
        """保存 Cookie 到文件"""
        try:
            output_file = "douyin_cookies_temp.json"
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(cookie_data, f, ensure_ascii=False, indent=2)
            
            print(f"\n📁 Cookie 已保存到文件: {output_file}")
            
            # 同时保存纯 Cookie 字符串
            cookie_file = "douyin_cookie_temp.txt"
            with open(cookie_file, 'w', encoding='utf-8') as f:
                f.write(cookie_data['cookies'])
            
            print(f"📁 纯 Cookie 已保存到: {cookie_file}")
            
            return True
            
        except Exception as e:
            print(f"❌ 保存 Cookie 失败: {str(e)}")
            return False
    
    def cleanup(self):
        """关闭浏览器"""
        if self.driver:
            try:
                self.driver.quit()
                print("\n🔒 浏览器已关闭")
            except:
                pass
    
    def run(self):
        """运行完整流程"""
        print("=" * 60)
        print("🎵 抖音 Cookie 自动获取工具")
        print("=" * 60)
        print()
        
        try:
            # 1. 初始化浏览器
            if not self.setup_driver():
                return None
            
            # 2. 打开登录页面
            if not self.open_login_page():
                return None
            
            # 3. 等待登录
            if not self.wait_for_login(timeout=300):
                print("\n⚠️ 登录超时，但如果您已完成登录，系统仍会尝试获取 Cookie")
            
            # 4. 获取 Cookie
            cookie_data = self.get_cookies()
            
            if cookie_data:
                # 5. 保存到文件
                self.save_to_file(cookie_data)
                
                print("\n" + "=" * 60)
                print("✅ 操作完成！")
                print("=" * 60)
                
                return cookie_data
            else:
                print("\n❌ 获取 Cookie 失败")
                return None
                
        except KeyboardInterrupt:
            print("\n\n⚠️ 用户中断操作")
            return None
        except Exception as e:
            print(f"\n\n❌ 发生错误: {str(e)}")
            return None
        finally:
            # 询问是否关闭浏览器
            print("\n按 Enter 键关闭浏览器...")
            try:
                input()
            except:
                pass
            self.cleanup()

def main():
    fetcher = DouyinCookieFetcher()
    result = fetcher.run()
    
    if result:
        print("\n获取到的 Cookie:")
        print(result['cookies'][:200] + "..." if len(result['cookies']) > 200 else result['cookies'])

if __name__ == "__main__":
    main()
