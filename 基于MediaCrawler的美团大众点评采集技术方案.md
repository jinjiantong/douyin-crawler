# 基于 MediaCrawler 的美团与大众点评数据采集技术方案

## 一、项目背景与目标

### 1.1 项目背景

MediaCrawler 是当前较为成熟的社交媒体数据采集框架，采用 FastAPI + 异步架构设计，已支持抖音、快手、B站、小红书、微博、淘宝、京东等主流平台。在实际业务场景中，美团与大众点评作为国内领先的生活服务平台，蕴含着丰富的商户信息、用户评价、消费行为等数据，具有重要的商业分析价值。

当前 MediaCrawler 尚未支持美团与大众点评两个平台的数据采集功能，本方案旨在基于现有框架架构进行扩展开发，实现对这两个平台的数据采集能力。

### 1.2 采集目标

| 平台 | 采集数据类型 | 说明 |
|:---:|:---|:---|
| 大众点评 | 商户基本信息 | 店铺名称、地址、电话、评分、环境/口味/服务评分 |
| 大众点评 | 用户评价 | 评论内容、评分、时间、点赞数 |
| 大众点评 | 商户图片 | 店铺环境图、菜品图 |
| 大众点评 | 团购信息 | 优惠套餐、价格 |
| 美团 | 商户信息 | 店铺名称、地址、评分、品类 |
| 美团 | 用户评价 | 评论内容、评分、时间 |
| 美团 | 团购套餐 | 套餐名称、价格、销量 |
| 美团 | 商家活动 | 满减优惠、折扣信息 |

### 1.3 项目目标

本项目的核心目标包括：

第一，**平台集成**：将美团与大众点评两个平台作为独立模块集成到 MediaCrawler 框架中，保持与现有模块一致的设计规范和调用方式。

第二，**核心功能实现**：完成商户搜索、商户详情、用户评价等核心数据采集功能，支持分页遍历和增量更新。

第三，**技术难点突破**：解决两个平台特有的签名算法逆向、字体反爬、设备指纹模拟等技术问题，建立稳定可用的采集方案。

第四，**工程化落地**：提供完整的账号管理、代理池、任务调度、错误处理等工程化能力，确保系统可长期稳定运行。

## 二、技术可行性分析

### 2.1 平台反爬机制对比

| 防护维度 | 大众点评 | 美团 | 对比结论 |
|:---|:---:|:---:|:---|
| 签名验证 | mtgsig 1.2+ | mtgsig 3.0 / x-sign | 美团签名更复杂 |
| Token机制 | _token 动态生成 | 动态 token + 安全检测 | 都需要逆向 |
| 设备指纹 | UA、屏幕、字体 | AppScan 检测 | 美团更严格 |
| 频率限制 | IP/账号级别 | 风控系统联动 | 美团更敏感 |
| 验证码 | 滑块、点选 | 多重验证 | 都需要处理 |
| 字体反爬 | 自定义字体加密 | 普通字体 | 大众点评特有 |

### 2.2 技术难点评估

| 技术难点 | 大众点评 | 美团 | 解决方案 |
|:---|:---:|:---:|:---|
| 签名算法逆向 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | JavaScript逆向 / Native层Hook |
| 字体反爬 | ⭐⭐⭐⭐ | - | 字体映射表 + 动态更新 |
| 设备指纹 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 环境模拟 / 代理轮换 |
| 数据解析 | ⭐⭐ | ⭐⭐ | 结构化解析 + JSON提取 |
| 验证码处理 | ⭐⭐⭐ | ⭐⭐⭐ | 打码平台 / 行为模拟 |
| 持续维护 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 监控告警 + 快速响应 |

### 2.3 可行性结论

| 评估维度 | 大众点评 | 美团 |
|:---|:---:|:---:|
| 技术可行性 | ✅ 可行 | ✅ 可行 |
| 开发周期 | 4-6 周 | 6-10 周 |
| 维护成本 | 中等 | 较高 |
| 建议优先级 | 1（优先） | 2 |

**结论**：基于 MediaCrawler 框架扩展开发美团和大众点评采集模块在技术层面完全可行。大众点评由于签名算法相对简单、第三方参考资料丰富，建议作为优先开发目标。美团的技术难度略高，但同样可以通过签名逆向和设备指纹模拟实现。

## 三、架构设计

### 3.1 整体架构

本方案在 MediaCrawler 现有架构基础上进行扩展，保持框架的统一性和一致性。整体架构分为四个层次：API 路由层、业务视图层、逻辑处理层和公共库层。新增的美团和大众点评模块将遵循与现有模块完全相同的架构模式。

```
┌─────────────────────────────────────────────────────────────────┐
│                         MediaCrawler                             │
├─────────────────────────────────────────────────────────────────┤
│  API 路由层                                                       │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐            │
│  │ douyin  │ xhs     │ weibo   │ dianping│ meituan │            │
│  │ urls.py │ urls.py │ urls.py │ urls.py │ urls.py │            │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘            │
├─────────────────────────────────────────────────────────────────┤
│  视图层                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ views/  (add_account, search, detail, comments...)  │        │
│  └─────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  逻辑层                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ logic/  (common, search, detail, comments...)       │        │
│  └─────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  公共库层                                                         │
│  ┌──────────┬──────────┬──────────┬──────────┐                  │
│  │ requests │  signer  │  proxy   │  logger  │                  │
│  └──────────┴──────────┴──────────┴──────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 目录结构设计

新增美团和大众点评模块后的目录结构如下：

```
Crawler-main/
├── config/
│   └── config.yaml                    # 主配置文件
├── data/
│   ├── douyin/                        # 抖音数据
│   ├── xhs/                           # 小红书数据
│   ├── dianping/                      # 大众点评数据 [新增]
│   │   └── dianping.db                # 账号数据库
│   └── meituan/                       # 美团数据 [新增]
│       └── meituan.db                 # 账号数据库
├── lib/
│   ├── js/                            # JavaScript签名算法
│   │   ├── douyin.js                  # 抖音签名
│   │   ├── xhs.js                     # 小红书签名
│   │   ├── dianping.js                # 大众点评签名 [新增]
│   │   └── meituan.js                 # 美团签名 [新增]
│   ├── font/                          # 字体映射 [新增]
│   │   └── dianping_fonts.py          # 大众点评字体映射
│   ├── requests/
│   └── logger/
├── service/
│   ├── douyin/
│   ├── bilibili/
│   ├── kuaishou/
│   ├── xhs/
│   ├── weibo/
│   ├── taobao/
│   ├── jd/
│   ├── dianping/                      # 大众点评服务 [新增]
│   │   ├── urls.py                    # 路由配置
│   │   ├── models.py                  # 数据模型
│   │   ├── views/                     # 视图层
│   │   │   ├── add_account.py
│   │   │   ├── expire_account.py
│   │   │   ├── account_list.py
│   │   │   ├── search.py
│   │   │   ├── detail.py
│   │   │   ├── comments.py
│   │   │   └── images.py
│   │   └── logic/                     # 业务逻辑层
│   │       ├── common.py
│   │       ├── search.py
│   │       ├── detail.py
│   │       ├── comments.py
│   │       └── font_decode.py         # 字体解密
│   └── meituan/                       # 美团服务 [新增]
│       ├── urls.py
│       ├── models.py
│       ├── views/
│       │   ├── add_account.py
│       │   ├── expire_account.py
│       │   ├── account_list.py
│       │   ├── search.py
│       │   ├── detail.py
│       │   ├── comments.py
│       │   └── deals.py
│       └── logic/
│           ├── common.py
│           ├── search.py
│           ├── detail.py
│           ├── comments.py
│           └── deals.py
└── main.py
```

### 3.3 模块接口设计

#### 3.3.1 大众点评模块接口

| 接口路径 | 方法 | 功能 | 参数 |
|:---|:---:|:---|:---|
| `/dianping/add_account` | POST | 添加账号Cookie | id, cookie |
| `/dianping/expire_account` | POST | 标记账号过期 | id |
| `/dianping/account_list` | GET | 获取账号列表 | - |
| `/dianping/search` | GET | 关键词搜索商户 | keyword, city, offset, limit |
| `/dianping/detail` | GET | 获取商户详情 | shop_id |
| `/dianping/comments` | GET | 获取商户评论 | shop_id, offset, limit |
| `/dianping/images` | GET | 获取商户图片 | shop_id, type, offset, limit |

#### 3.3.2 美团模块接口

| 接口路径 | 方法 | 功能 | 参数 |
|:---|:---:|:---|:---|
| `/meituan/add_account` | POST | 添加账号Cookie | id, cookie |
| `/meituan/expire_account` | POST | 标记账号过期 | id |
| `/meituan/account_list` | GET | 获取账号列表 | - |
| `/meituan/search` | GET | 关键词搜索商户 | keyword, city_id, offset, limit |
| `/meituan/detail` | GET | 获取商户详情 | poi_id |
| `/meituan/comments` | GET | 获取商户评论 | poi_id, offset, limit |
| `/meituan/deals` | GET | 获取团购套餐 | poi_id, offset, limit |

## 四、详细实现方案

### 4.1 大众点评实现方案

#### 4.1.1 签名算法逆向

大众点评使用 mtgsig 1.2+ 签名算法，需要逆向 JavaScript 代码实现签名生成。

**逆向步骤**：

第一步，从浏览器开发者工具中提取完整的签名算法 JavaScript 代码。主要关注 `_token` 生成函数和 `mtgsig` 参数的构建逻辑。

第二步，将提取的 JavaScript 代码保存为 `lib/js/dianping.js`，使用 Node.js 环境执行。签名生成函数应包含请求 URL、请求参数、Cookie 等输入，输出签名结果。

第三步，在 Python 端通过 PyExecJS 或 py_mini_racer 调用 JavaScript 代码生成签名。

```python
# service/dianping/logic/signer.py
import httpx
from py_mini_racer import MiniRacer
from pathlib import Path

class DianpingSigner:
    def __init__(self):
        self.ctx = MiniRacer()
        js_path = Path(__file__).parent.parent.parent.parent / "lib" / "js" / "dianping.js"
        self.ctx.eval(js_path.read_text(encoding='utf-8'))
    
    def generate_sign(self, url: str, params: dict, cookie: str) -> dict:
        result = self.ctx.call('generateDianpingSign', url, params, cookie)
        return {
            '_token': result.get('token', ''),
            'mtgsig': result.get('mtgsig', {})
        }
```

#### 4.1.2 字体反爬处理

大众点评使用自定义字体文件进行数据加密，数字显示使用 SVG 字体映射。

**字体解密流程**：

第一步，请求页面时获取 CSS 文件中的字体文件 URL。字体文件通常为 `.woff2` 或 `.svg` 格式。

第二步，下载并解析字体文件，使用 fontTools 库读取字符映射关系。

第三步，建立数字字符与实际数值的映射表。映射表需要定期更新，因为平台会更换字体。

```python
# service/dianping/logic/font_decode.py
import re
import requests
from fontTools.ttLib import TTFont
from io import BytesIO

class FontDecoder:
    # 字体映射表（需要根据实际字体文件更新）
    NUMBER_MAP = {
        'uniE824': '0', 'uniE825': '1', 'uniE826': '2',
        'uniE827': '3', 'uniE828': '4', 'uniE829': '5',
        'uniE82A': '6', 'uniE82B': '7', 'uniE82C': '8',
        'uniE82D': '9'
    }
    
    def __init__(self):
        self.font_cache = {}
    
    def get_font_map(self, font_url: str) -> dict:
        if font_url in self.font_cache:
            return self.font_cache[font_url]
        
        response = requests.get(font_url)
        font = TTFont(BytesIO(response.content))
        cmap = font.getBestMap()
        
        # 构建映射表
        font_map = {}
        for uni, glyph_name in cmap.items():
            if glyph_name and glyph_name.startswith('uni'):
                char = chr(uni) if uni < 0xFFFF else None
                if char:
                    # 查找对应的数字
                    for num_uni, num in self.NUMBER_MAP.items():
                        if glyph_name == num_uni.replace('uni', 'uni'):
                            font_map[char] = num
                            break
        
        self.font_cache[font_url] = font_map
        return font_map
    
    def decode_text(self, text: str, font_url: str) -> str:
        font_map = self.get_font_map(font_url)
        result = []
        for char in text:
            result.append(font_map.get(char, char))
        return ''.join(result)
```

#### 4.1.3 搜索功能实现

```python
# service/dianping/logic/search.py
import httpx
from typing import Optional
from .common import common_request
from .font_decode import FontDecoder

class DianpingSearch:
    def __init__(self):
        self.font_decoder = FontDecoder()
    
    async def search_shop(self, keyword: str, city: str = "上海", 
                          offset: int = 0, limit: int = 20) -> tuple[dict, bool]:
        url = "https://www.dianping.com/search/ajax/infos"
        params = {
            'keyword': keyword,
            'cityname': city,
            'page': offset // limit + 1,
            'count': limit
        }
        
        resp, succ = await common_request(url, params, {})
        
        if not succ:
            return resp, False
        
        # 处理字体加密的数据
        shops = resp.get('shopList', [])
        for shop in shops:
            if 'shopName' in shop:
                # 店铺名称可能也需要字体解密
                pass
            if 'avgPrice' in shop:
                # 价格数据解密
                font_url = resp.get('fontUrl', '')
                if font_url:
                    shop['avgPrice'] = self.font_decoder.decode_text(
                        str(shop['avgPrice']), font_url
                    )
        
        return {'list': shops, 'total': resp.get('total', 0)}, True
```

#### 4.1.4 评论采集实现

```python
# service/dianping/logic/comments.py
import httpx
from typing import Optional
from .common import common_request
from .font_decode import FontDecoder

class DianpingComments:
    def __init__(self):
        self.font_decoder = FontDecoder()
    
    async def get_comments(self, shop_id: str, offset: int = 0, 
                           limit: int = 20) -> tuple[dict, bool]:
        url = f"https://www.dianping.com/shop/{shop_id}/review_all"
        params = {
            'pageno': offset // limit + 1,
            'sortType': 1,
            'category': '',
            'cityid': 2
        }
        
        resp, succ = await common_request(url, params, {})
        
        if not succ:
            return resp, False
        
        comments = resp.get('reviewList', [])
        
        # 解密评论中的数字（点赞数、评分等）
        for comment in comments:
            if 'favorCount' in comment:
                comment['favorCount'] = self._decode_number(comment['favorCount'])
        
        return {
            'list': comments,
            'total': resp.get('total', 0),
            'has_more': resp.get('hasMore', 0)
        }, True
```

### 4.2 美团实现方案

#### 4.2.1 签名算法逆向

美团使用更复杂的 mtgsig 3.0 签名算法，部分逻辑在 Native 层实现，难度更高。

**逆向策略**：

第一种方案，JavaScript 逆向。对于 H5 页面和小程序，可以使用浏览器开发者工具提取 JavaScript 签名代码，然后在 Python 端执行。这种方案适用于网页版美团。

第二种方案，Native Hook。使用 Frida 对美团 App 进行动态 Hook，直接获取签名参数。这种方案适用于 App 数据采集，但需要处理 App 安全检测。

第三种方案，模拟执行。在高配置环境中运行美团 App，通过中间人代理拦截请求获取签名参数。

```python
# service/meituan/logic/signer.py
import httpx
from py_mini_racer import MiniRacer
from pathlib import Path

class MeituanSigner:
    def __init__(self):
        self.ctx = MiniRacer()
        js_path = Path(__file__).parent.parent.parent.parent / "lib" / "js" / "meituan.js"
        self.ctx.eval(js_path.read_text(encoding='utf-8'))
        self._setup_device_fingerprint()
    
    def _setup_device_fingerprint(self):
        # 模拟设备指纹参数
        self.device_info = {
            'appVersion': '12.5.201',
            'platform': 2,
            'market': 'meituan',
            'cityId': 2,
            'deviceId': self._generate_device_id()
        }
    
    def _generate_device_id(self) -> str:
        import uuid
        return str(uuid.uuid4()).upper()
    
    def generate_sign(self, url: str, params: dict, cookie: str) -> dict:
        # 合并设备信息和请求参数
        full_params = {**self.device_info, **params}
        
        result = self.ctx.call('generateMeituanSign', url, full_params, cookie)
        
        return {
            'x-sign': result.get('x-sign', ''),
            'x-stoken': result.get('x-stoken', ''),
            'x-t': result.get('x-t', ''),
            'x-bz': result.get('x-bz', ''),
            'x-devid': result.get('x-devid', '')
        }
```

#### 4.2.2 搜索功能实现

```python
# service/meituan/logic/search.py
import httpx
from typing import Optional
from .common import common_request

class MeituanSearch:
    def __init__(self):
        self.base_url = "https://apimobile.meituan.com"
    
    async def search_shop(self, keyword: str, city_id: int = 2,
                          offset: int = 0, limit: int = 32) -> tuple[dict, bool]:
        url = f"{self.base_url}/group/v4/poi/pcsearch/search"
        params = {
            'cityId': city_id,
            'keyword': keyword,
            'page': offset // limit + 1,
            'limit': limit
        }
        
        resp, succ = await common_request(url, params, {})
        
        if not succ:
            return resp, False
        
        pois = resp.get('data', {}).get('searchResult', [])
        
        return {
            'list': pois,
            'total': resp.get('data', {}).get('total', 0),
            'has_more': resp.get('data', {}).get('hasMore', 0)
        }, True
```

#### 4.2.3 评论采集实现

```python
# service/meituan/logic/comments.py
import httpx
from typing import Optional
from .common import common_request

class MeituanComments:
    def __init__(self):
        self.base_url = "https://apimobile.meituan.com"
    
    async def get_comments(self, poi_id: str, offset: int = 0,
                           limit: int = 10) -> tuple[dict, bool]:
        url = f"{self.base_url}/group/v1/poi/comment/"
        params = {
            'id': poi_id,
            'page': offset // limit + 1,
            'limit': limit,
            'sortType': 1
        }
        
        resp, succ = await common_request(url, params, {})
        
        if not succ:
            return resp, False
        
        comments = resp.get('data', {}).get('comments', [])
        
        return {
            'list': comments,
            'total': resp.get('data', {}).get('total', 0),
            'has_more': resp.get('data', {}).get('hasMore', 0)
        }, True
```

### 4.3 公共模块增强

#### 4.3.1 请求模块扩展

```python
# lib/requests/requests.py
import httpx
import asyncio
from typing import Optional, Dict, Any

class RequestClient:
    def __init__(self):
        self.client = None
        self.retry_times = 3
        self.retry_delay = 1
    
    async def get(self, url: str, headers: Optional[Dict] = None,
                  params: Optional[Dict] = None, 
                  proxy: Optional[str] = None) -> tuple[Any, bool]:
        for attempt in range(self.retry_times):
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    response = await client.get(
                        url, 
                        headers=headers, 
                        params=params,
                        proxy=proxy
                    )
                    
                    if response.status_code == 200:
                        try:
                            return response.json(), True
                        except:
                            return response.text, True
                    elif response.status_code == 403:
                        # 被风控拦截
                        return {'error': 'blocked', 'code': 403}, False
                    elif response.status_code == 418:
                        # IP被封禁
                        return {'error': 'ip_blocked', 'code': 418}, False
                    else:
                        return {'error': 'http_error', 'code': response.status_code}, False
                        
            except httpx.TimeoutException:
                if attempt < self.retry_times - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
                return {'error': 'timeout'}, False
            except Exception as e:
                if attempt < self.retry_times - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
                return {'error': str(e)}, False
        
        return {'error': 'max_retry'}, False
```

#### 4.3.2 账号管理模块

```python
# service/dianping/models.py
from data.driver import CommonAccount

class DianpingAccount(CommonAccount):
    def __init__(self):
        super().__init__("data/dianping/dianping.db")
    
    async def load_valid(self) -> list:
        accounts = await self.load()
        return [acc for acc in accounts if acc.get('expired', 0) != 1]
```

## 五、技术难点与解决方案

### 5.1 签名算法维护

**问题描述**：美团和大众点评会不定期更新签名算法，导致采集功能失效。

**解决方案**：

第一，建立签名版本管理机制。记录每次签名算法变更的版本号、变更时间和特征。

第二，实现签名失效检测。在请求返回特定错误码时，触发签名重新逆向流程。

第三，建立签名更新工作流。通过监控告警通知开发人员，快速完成签名更新。

```python
# lib/signer/version_manager.py
import time
from pathlib import Path
import json

class SignerVersionManager:
    def __init__(self, platform: str):
        self.platform = platform
        self.version_file = Path(f"data/{platform}/signer_version.json")
        self.current_version = self._load_version()
    
    def _load_version(self) -> dict:
        if self.version_file.exists():
            return json.loads(self.version_file.read_text())
        return {'version': 1, 'last_update': time.time()}
    
    def is_valid(self) -> bool:
        # 签名有效期为24小时
        return time.time() - self.current_version['last_update'] < 86400
    
    def update_version(self):
        self.current_version['version'] += 1
        self.current_version['last_update'] = time.time()
        self.version_file.parent.mkdir(parents=True, exist_ok=True)
        self.version_file.write_text(json.dumps(self.current_version))
```

### 5.2 字体映射表更新

**问题描述**：大众点评的字体文件会定期更新，导致数字解密失败。

**解决方案**：

第一，建立字体版本监控。当解密结果出现异常字符时，触发字体更新流程。

第二，自动下载最新字体。定期抓取页面获取最新字体文件 URL，下载并更新映射表。

第三，OCR兜底方案。对于无法映射的字符，使用 OCR 进行识别。

```python
# service/dianping/logic/font_manager.py
import hashlib
from fontTools.ttLib import TTFont
from pathlib import Path
import pickle

class FontManager:
    def __init__(self):
        self.font_dir = Path("data/dianping/fonts")
        self.font_dir.mkdir(parents=True, exist_ok=True)
        self.mapping_file = self.font_dir / "mappings.pkl"
        self.mappings = self._load_mappings()
    
    def _load_mappings(self) -> dict:
        if self.mapping_file.exists():
            return pickle.loads(self.mapping_file.read_bytes())
        return {}
    
    def _save_mappings(self):
        self.mapping_file.write_bytes(pickle.dumps(self.mappings))
    
    def get_or_create_mapping(self, font_url: str) -> dict:
        if font_url in self.mappings:
            return self.mappings[font_url]
        
        # 下载并解析字体
        import requests
        response = requests.get(font_url)
        
        font_hash = hashlib.md5(response.content).hexdigest()
        if font_hash in self.mappings:
            return self.mappings[font_hash]
        
        # 解析字体文件
        from io import BytesIO
        font = TTFont(BytesIO(response.content))
        cmap = font.getBestMap()
        
        # 建立新的映射表（需要人工标注或自动学习）
        mapping = self._build_mapping(cmap)
        
        self.mappings[font_hash] = mapping
        self.mappings[font_url] = mapping
        self._save_mappings()
        
        return mapping
    
    def _build_mapping(self, cmap: dict) -> dict:
        # 根据字符形状进行简单匹配
        # 复杂场景需要机器学习或人工标注
        return {}
```

### 5.3 验证码处理

**问题描述**：高频请求或异常行为会触发验证码，导致采集中断。

**解决方案**：

第一，请求频率控制。设置合理的请求间隔，使用代理池分散请求。

第二，打码平台集成。对接超级鹰、打码啦等第三方打码服务。

第三，行为模拟。在请求中添加随机延迟、随机 UA 等，模拟人类行为。

```python
# lib/captcha/handler.py
import random
import asyncio

class CaptchaHandler:
    def __init__(self):
        self.captcha_api = "http://api.dama2.com:7766"
        self.username = ""  # 打码平台账号
        self.password = ""  # 打码平台密码
    
    async def solve_slider(self, image_url: str) -> str:
        # 下载图片
        import requests
        image_data = requests.get(image_url).content
        
        # 调用打码平台
        # 实际使用时需要注册打码平台账号
        captcha_id, result = await self._submit_captcha(image_data, 6101)
        
        if captcha_id:
            # 等待识别结果
            await asyncio.sleep(3)
            offset = await self._get_result(captcha_id)
            return str(offset)
        
        return ""
    
    async def solve_click(self, image_url: str, tip: str) -> list:
        # 点选验证码处理
        import requests
        image_data = requests.get(image_url).content
        
        captcha_id, result = await self._submit_captcha(image_data, 6102, tip)
        
        if captcha_id:
            await asyncio.sleep(3)
            positions = await self._get_result(captcha_id)
            return positions
        
        return []
```

## 六、开发计划

### 6.1 阶段划分

| 阶段 | 周期 | 目标 | 交付物 |
|:---:|:---:|:---|:---|
| 第一阶段 | 2周 | 大众点评基础功能 | 签名、搜索、商户详情 |
| 第二阶段 | 2周 | 大众点评核心功能 | 评论采集、字体解密 |
| 第三阶段 | 3周 | 美团基础功能 | 签名、搜索、商户详情 |
| 第四阶段 | 2周 | 美团核心功能 | 评论采集、套餐采集 |
| 第五阶段 | 1周 | 集成测试与优化 | 联调测试、性能优化 |
| **总计** | **10周** | - | 完整可用系统 |

### 6.2 详细任务分解

#### 第一阶段：大众点评基础功能（第1-2周）

| 任务 | 工时 | 说明 |
|:---|:---:|:---|
| 项目环境搭建 | 2天 | 搭建开发环境、配置调试工具 |
| 签名算法逆向 | 5天 | 提取并验证 mtgsig 签名算法 |
| 目录结构创建 | 1天 | 创建模块目录和基础文件 |
| 账号管理功能 | 2天 | 实现 Cookie 添加、轮换、过期处理 |
| 搜索功能开发 | 3天 | 商户关键词搜索接口 |

#### 第二阶段：大众点评核心功能（第3-4周）

| 任务 | 工时 | 说明 |
|:---|:---:|:---|
| 商户详情接口 | 2天 | 获取完整商户信息 |
| 评论采集开发 | 3天 | 多页评论遍历采集 |
| 字体解密实现 | 4天 | 字体文件解析和映射表管理 |
| 图片采集功能 | 2天 | 商户图片批量下载 |
| 单模块测试 | 2天 | 功能测试和Bug修复 |

#### 第三阶段：美团基础功能（第5-7周）

| 任务 | 工时 | 说明 |
|:---|:---:|:---|
| 签名算法逆向 | 8天 | 重点：mtgsig 3.0 / x-sign 逆向 |
| 设备指纹模拟 | 3天 | 模拟 App 环境参数 |
| 目录结构创建 | 1天 | 创建模块目录和基础文件 |
| 账号管理功能 | 2天 | Cookie 管理功能 |
| 搜索功能开发 | 3天 | 商户搜索接口 |

#### 第四阶段：美团核心功能（第8-9周）

| 任务 | 工时 | 说明 |
|:---|:---:|:---|
| 商户详情接口 | 2天 | 获取完整商户信息 |
| 评论采集开发 | 3天 | 多页评论遍历采集 |
| 团购套餐采集 | 3天 | 套餐信息获取 |
| 风控规避 | 2天 | 请求频率和参数优化 |

#### 第五阶段：集成测试与优化（第10周）

| 任务 | 工时 | 说明 |
|:---|:---:|:---|
| 框架集成 | 2天 | 与 MediaCrawler 主框架对接 |
| 联调测试 | 2天 | 全流程测试 |
| 性能优化 | 2天 | 并发、缓存优化 |
| 文档编写 | 1天 | 使用文档和接口文档 |

### 6.3 人力配置

| 角色 | 人数 | 职责 |
|:---|:---:|:---|
| 逆向工程师 | 1人 | 签名算法逆向、字体解析 |
| 后端开发工程师 | 1人 | 模块开发、API实现 |
| 测试工程师 | 0.5人 | 功能测试、回归测试 |

## 七、资源需求

### 7.1 开发资源

| 资源类型 | 规格 | 数量 | 用途 |
|:---|:---|:---:|:---|
| 开发服务器 | 4核8G | 1台 | 本地开发、签名测试 |
| 采集服务器 | 8核16G | 2台 | 生产环境部署 |
| 代理IP | 高匿住宅IP | 500+ | 请求分散、规避封禁 |

### 7.2 软件工具

| 工具 | 用途 | 费用 |
|:---|:---|:---:|
| Charles / Fiddler | 抓包分析 | 免费 |
|jadx | APK 反编译 | 免费 |
| Frida | 动态 Hook | 免费 |
| PyCharm / VSCode | 开发IDE | 免费 |
| Node.js | JS 执行环境 | 免费 |
| 超级鹰打码 | 验证码识别 | 按量计费 |

### 7.3 第三方服务

| 服务 | 用途 | 成本估算 |
|:---|:---|:---:|
| 打码平台 | 验证码处理 | 500-1000元/月 |
| 代理IP服务 | IP轮换 | 300-500元/月 |
| 云服务器 | 生产部署 | 500-1000元/月 |

## 八、风险评估与应对

### 8.1 技术风险

| 风险 | 概率 | 影响 | 应对措施 |
|:---|:---:|:---:|:---|
| 签名算法无法逆向 | 中 | 高 | 预留更多逆向时间；考虑 App Hook 方案 |
| 字体映射表失效 | 高 | 中 | 建立自动更新机制；OCR 兜底方案 |
| 平台加强反爬 | 中 | 高 | 持续监控；快速响应更新 |
| 采集效率不达标 | 中 | 中 | 优化并发；增加代理池规模 |

### 8.2 业务风险

| 风险 | 概率 | 影响 | 应对措施 |
|:---|:---:|:---:|:---|
| 账号批量被封 | 高 | 中 | 多账号轮换；控制请求频率 |
| 数据质量不稳定 | 中 | 中 | 建立数据校验机制 |
| 法律合规风险 | 低 | 高 | 仅采集公开数据；法律顾问审核 |

### 8.3 进度风险

| 风险 | 概率 | 影响 | 应对措施 |
|:---|:---:|:---:|:---|
| 签名逆向周期过长 | 中 | 高 | 分阶段交付；MVP优先 |
| 第三方依赖不稳定 | 低 | 中 | 准备备选方案 |
| 人员变动 | 低 | 中 | 代码文档化；知识传承 |

## 九、总结

本方案基于 MediaCrawler 框架，详细设计了美团和大众点评两个平台的数据采集扩展方案。通过对平台反爬机制的分析和现有技术资源的调研，确认了技术实现的可行性。

方案的主要特点包括：保持与框架原有模块的一致性，降低学习成本和维护成本；采用分层架构，核心逻辑与签名算法解耦，便于后续更新；集成字体解密、验证码处理等关键技术，提升采集成功率；建立完善的监控和维护机制，确保系统长期稳定运行。

在资源投入方面，预计需要 10 周的开发周期和 2 人左右的人力投入。建议优先开发大众点评模块，积累经验后再扩展到美团平台。