import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, CheckCircle, Construction, ChevronRight, Video, Sparkles, Play, MessageCircle } from 'lucide-react';

const platforms = [
  {
    id: 'douyin',
    name: '抖音',
    nameEn: 'Douyin',
    icon: '🎵',
    color: '#fe2c55',
    status: 'active',
    statusText: '已上线',
    features: ['搜索', '详情', '评论', '二级评论', '主播主页'],
    link: '/douyin'
  },
  {
    id: 'xhs',
    name: '小红书',
    nameEn: 'Xiaohongshu',
    icon: '📕',
    color: '#ff2442',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', '博主主页'],
    link: '/xhs'
  },
  {
    id: 'bilibili',
    name: 'B站',
    nameEn: 'Bilibili',
    icon: '📺',
    color: '#00a1d6',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', 'UP主主页'],
    link: '/bilibili'
  },
  {
    id: 'kuaishou',
    name: '快手',
    nameEn: 'Kuaishou',
    icon: '📱',
    color: '#ff4906',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', '主播主页'],
    link: '/kuaishou'
  },
  {
    id: 'weibo',
    name: '微博',
    nameEn: 'Weibo',
    icon: '📝',
    color: '#e6162d',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', '博主主页'],
    link: '/weibo'
  },
  {
    id: 'tieba',
    name: '贴吧',
    nameEn: 'Tieba',
    icon: '🏠',
    color: '#0078d4',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', '用户主页'],
    link: '/tieba'
  },
  {
    id: 'zhihu',
    name: '知乎',
    nameEn: 'Zhihu',
    icon: '💬',
    color: '#0066ff',
    status: 'developing',
    statusText: '开发中',
    features: ['搜索', '详情', '评论', '二级评论', '用户主页'],
    link: '/zhihu'
  }
];

const PlatformCard = ({ platform }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(platform.link)}
      className={`
        relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 
        border border-gray-700/50 cursor-pointer
        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
        group overflow-hidden
        ${platform.status === 'active' ? 'hover:border-primary-500/50' : 'hover:border-gray-600/50'}
      `}
    >
      {platform.status === 'active' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: `${platform.color}20`, boxShadow: `0 4px 20px ${platform.color}30` }}
            >
              {platform.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-400">{platform.nameEn}</p>
            </div>
          </div>
          
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${platform.status === 'active' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
            }
          `}>
            {platform.status === 'active' ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Construction className="w-3 h-3" />
            )}
            {platform.statusText}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {platform.features.map((feature, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              点击进入 {platform.name}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformSelect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            多平台数据采集系统
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Multi-Platform Crawler
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            支持抖音、小红书、B站、快手、微博、贴吧、知乎等主流平台的公开数据采集
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 bg-gray-800/50 backdrop-blur-sm rounded-full px-8 py-4 border border-gray-700/50">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary-400" />
              <span className="text-gray-400">视频数据</span>
            </div>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-400" />
              <span className="text-gray-400">评论采集</span>
            </div>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">用户分析</span>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024-2026 多平台数据采集系统. 仅供学习和研究使用.</p>
          <p className="mt-2">服务状态: <span className="text-green-400">● 正常运行</span></p>
        </footer>
      </div>
    </div>
  );
};

export default PlatformSelect;