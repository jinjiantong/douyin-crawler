import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction, Clock, AlertCircle } from 'lucide-react';

const PlatformPlaceholder = ({ platform }) => {
  const navigate = useNavigate();
  const goHome = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={goHome}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  {platform.icon}
                </div>
                <div>
                  <h1 className="font-bold text-lg">{platform.name} 数据采集</h1>
                  <p className="text-xs text-gray-400">{platform.nameEn} Crawler</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                <Construction className="w-3 h-3" />
                开发中
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6"
              style={{ backgroundColor: `${platform.color}20`, boxShadow: `0 8px 32px ${platform.color}20` }}
            >
              {platform.icon}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {platform.name} 功能开发中
            </h2>
            <p className="text-gray-400 text-lg">
              {platform.name} ({platform.nameEn}) 的数据采集功能正在紧张开发中，
              敬请期待！
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">预计功能</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platform.features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-700/50 rounded-lg px-4 py-3 text-gray-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">温馨提示</h3>
            </div>
            <p className="text-gray-400">
              抖音平台的数据采集功能已完整实现，您现在就可以使用。
              欢迎体验抖音功能，其他平台功能将陆续上线。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goHome}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              返回平台选择
            </button>
            <Link
              to="/douyin"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              使用抖音功能 →
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            © 2024-2026 多平台数据采集系统. 仅供学习和研究使用.
          </div>
        </div>
      </footer>
    </div>
  );
};

const platformConfigs = {
  xhs: {
    id: 'xhs',
    name: '小红书',
    nameEn: 'Xiaohongshu',
    icon: '📕',
    color: '#ff2442',
    features: ['关键词搜索', '帖子详情', '评论采集', '二级评论', '博主主页']
  },
  bilibili: {
    id: 'bilibili',
    name: 'B站',
    nameEn: 'Bilibili',
    icon: '📺',
    color: '#00a1d6',
    features: ['关键词搜索', '视频详情', '弹幕/评论', '楼层回复', 'UP主主页']
  },
  kuaishou: {
    id: 'kuaishou',
    name: '快手',
    nameEn: 'Kuaishou',
    icon: '📱',
    color: '#ff4906',
    features: ['关键词搜索', '视频详情', '评论采集', '二级评论', '主播主页']
  },
  weibo: {
    id: 'weibo',
    name: '微博',
    nameEn: 'Weibo',
    icon: '📝',
    color: '#e6162d',
    features: ['关键词搜索', '微博详情', '评论采集', '二级评论', '博主主页']
  },
  tieba: {
    id: 'tieba',
    name: '贴吧',
    nameEn: 'Tieba',
    icon: '🏠',
    color: '#0078d4',
    features: ['关键词搜索', '帖子详情', '楼中楼', '二级回复', '用户主页']
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    nameEn: 'Zhihu',
    icon: '💬',
    color: '#0066ff',
    features: ['关键词搜索', '回答详情', '评论采集', '二级评论', '用户主页']
  }
};

const XHSPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.xhs} />;
const BilibiliPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.bilibili} />;
const KuaishouPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.kuaishou} />;
const WeiboPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.weibo} />;
const TiebaPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.tieba} />;
const ZhihuPlaceholder = () => <PlatformPlaceholder platform={platformConfigs.zhihu} />;

export { XHSPlaceholder, BilibiliPlaceholder, KuaishouPlaceholder, WeiboPlaceholder, TiebaPlaceholder, ZhihuPlaceholder };