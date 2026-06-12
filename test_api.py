import requests
import time

print("=" * 60)
print("测试后端 API")
print("=" * 60)
print()

# 测试 1: 检查服务是否运行
print("1. 检查服务状态...")
try:
    r = requests.get('http://localhost:8080/cookie/status')
    print(f"   状态码: {r.status_code}")
    print(f"   响应: {r.text}")
    if r.status_code == 200:
        print("   ✅ 服务运行正常")
except Exception as e:
    print(f"   ❌ 错误: {e}")
print()

# 测试 2: 测试 Cookie fetch API
print("2. 测试 Cookie 启动 API...")
try:
    r = requests.post('http://localhost:8080/cookie/fetch')
    print(f"   状态码: {r.status_code}")
    print(f"   响应: {r.text}")
    if r.status_code == 200:
        print("   ✅ API 调用成功")
except Exception as e:
    print(f"   ❌ 错误: {e}")
print()

# 测试 3: 测试 Cookie check API
print("3. 测试 Cookie 检查 API...")
try:
    r = requests.get('http://localhost:8080/cookie/check')
    print(f"   状态码: {r.status_code}")
    print(f"   响应: {r.text}")
    if r.status_code == 200:
        print("   ✅ API 调用成功")
except Exception as e:
    print(f"   ❌ 错误: {e}")
print()

# 测试 4: 测试抖音 API
print("4. 测试抖音账号 API...")
try:
    r = requests.get('http://localhost:8080/douyin/account_list')
    print(f"   状态码: {r.status_code}")
    print(f"   响应: {r.text}")
    if r.status_code == 200:
        print("   ✅ API 调用成功")
except Exception as e:
    print(f"   ❌ 错误: {e}")
print()

print("=" * 60)
print("测试完成！")
print()
print("如果所有测试通过，现在可以在前端使用了！")
print("访问: http://localhost:3000")
print("=" * 60)
