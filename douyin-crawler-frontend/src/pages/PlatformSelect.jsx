import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, CheckCircle, Clock, ChevronRight, Video, Sparkles, MessageCircle, Rocket } from 'lucide-react';

const platforms = [
  {
    id: 'douyin',
    name: '抖音',
    nameEn: 'Douyin',
    icon: '🎵',
    color: '#fe2c55',
    status: 'active',
    statusText: '已上线',
    features: ['关键词搜索', '视频详情', '全量评论', '二级回复', '主播主页'],
    link: '/douyin'
  },
  {
    id: 'xhs',
    name: '小红书',
    nameEn: 'Xiaohongshu',
    icon: '📕',
    color: '#ff2442',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '帖子详情', '评论采集', '二级回复', '博主主页'],
    link: '/xhs'
  },
  {
    id: 'bilibili',
    name: 'B站',
    nameEn: 'Bilibili',
    icon: '📺',
    color: '#00a1d6',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '视频详情', '弹幕评论', '楼层回复', 'UP主主页'],
    link: '/bilibili'
  },
  {
    id: 'kuaishou',
    name: '快手',
    nameEn: 'Kuaishou',
    icon: '📱',
    color: '#ff4906',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '视频详情', '评论采集', '二级回复', '主播主页'],
    link: '/kuaishou'
  },
  {
    id: 'weibo',
    name: '微博',
    nameEn: 'Weibo',
    icon: '📝',
    color: '#e6162d',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '微博详情', '评论采集', '二级回复', '博主主页'],
    link: '/weibo'
  },
  {
    id: 'tieba',
    name: '贴吧',
    nameEn: 'Tieba',
    icon: '🏠',
    color: '#0078d4',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '帖子详情', '楼中楼', '二级回复', '用户主页'],
    link: '/tieba'
  },
  {
    id: 'zhihu',
    name: '知乎',
    nameEn: 'Zhihu',
    icon: '💬',
    color: '#0066ff',
    status: 'developing',
    statusText: '待上线',
    features: ['关键词搜索', '回答详情', '评论采集', '二级回复', '用户主页'],
    link: '/zhihu'
  }
];

const PlatformCard = ({ platform }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(platform.link)}
      className={`
        relative bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 
        border-2 cursor-pointer
        transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl
        group overflow-hidden
        ${platform.status === 'active' 
          ? 'border-primary-500/40 hover:border-primary-500/70' 
          : 'border-gray-700/50 hover:border-gray-600/70'
        }
      `}
    >
      {platform.status === 'active' && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${platform.color}25`, boxShadow: `0 8px 32px ${platform.color}30` }}
          >
            {platform.icon}
          </div>
          
          <div className={`
            px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2
            ${platform.status === 'active' 
              ? 'bg-green-500/25 text-green-400 border border-green-500/30' 
              : 'bg-blue-500/25 text-blue-400 border border-blue-500/30'
            }
          `}>
            {platform.status === 'active' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            {platform.statusText}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">
          {platform.name}
        </h3>
        <p className="text-sm text-gray-500 mb-6">{platform.nameEn}</p>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {platform.features.map((feature, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 bg-gray-700/60 rounded-lg text-sm text-gray-300 border border-gray-600/30"
              >
                {feature}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50">
            <span className="text-base text-gray-400 group-hover:text-gray-200 transition-colors font-medium">
              {platform.status === 'active' ? '立即使用 →' : '即将推出'}
            </span>
            {platform.status === 'active' ? (
              <Rocket className="w-6 h-6 text-pink-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformSelect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30">
              <Globe className="w-9 h-9 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            多平台数据采集系统
          </h1>
          <p className="text-2xl text-gray-400 mb-4">
            Multi-Platform Crawler
          </p>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            支持抖音、小红书、B站、快手、微博、贴吧、知乎等主流平台的公开数据采集
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 bg-gray-800/70 backdrop-blur-sm rounded-2xl px-10 py-6 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-primary-400" />
              <span className="text-gray-300 font-medium">视频数据</span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-pink-400" />
              <span className="text-gray-300 font-medium">评论采集</span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-300 font-medium">用户分析</span>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center text-gray-500 text-base">
          <p>© 2024-2026 多平台数据采集系统. 仅供学习和研究使用.</p>
          <p className="mt-3">服务状态: <span className="text-green-400 font-medium">● 正常运行</span></p>
        </footer>
      </div>
    </div>
  );
};

export default PlatformSelect;