import React, { useState } from 'react';
import CookieManager from './components/CookieManager';
import VideoSearch from './components/VideoSearch';
import VideoDetail from './components/VideoDetail';
import CommentSection from './components/CommentSection';
import UserInfo from './components/UserInfo';
import LinkCollector from './components/LinkCollector';
import MultiVideoCollector from './components/MultiVideoCollector';
import {
  Cookie,
  Search,
  Video,
  MessageCircle,
  User,
  Menu,
  X,
  Link2
} from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previousView, setPreviousView] = useState('home');
  const [multiVideoData, setMultiVideoData] = useState(null);
  
  // 保存链接采集页面的数据
  const [linkCollectorData, setLinkCollectorData] = useState({
    url: '',
    result: null,
    error: ''
  });

  const handleVideoSelect = (videoId) => {
    setPreviousView(currentView);
    setSelectedVideoId(videoId);
    setCurrentView('videoDetail');
  };

  const handleViewComments = (videoId) => {
    setPreviousView(currentView);
    setSelectedVideoId(videoId);
    setCurrentView('comments');
  };

  const handleBatchCollect = (videos) => {
    setPreviousView(currentView);
    setMultiVideoData(videos);
    setCurrentView('multiVideo');
  };

  const handleViewUser = (userId) => {
    setPreviousView(currentView);
    setSelectedUserId(userId);
    setCurrentView('user');
  };

  const handleBack = () => {
    setCurrentView(previousView);
    setSelectedVideoId(null);
    setSelectedUserId(null);
    if (previousView !== 'multiVideo') {
      setMultiVideoData(null);
    }
  };

  const menuItems = [
    { id: 'home', label: '首页', icon: Cookie },
    { id: 'accounts', label: '账号管理', icon: User },
    { id: 'collect', label: '链接采集', icon: Link2 },
    { id: 'search', label: '搜索视频', icon: Search },
    { id: 'multiVideo', label: '多视频采集', icon: Video },
  ];

  const navigateTo = (viewId) => {
    setCurrentView(viewId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 顶部导航 */}
      <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">抖音采集系统</h1>
                  <p className="text-xs text-gray-400">Douyin Crawler</p>
                </div>
              </div>
            </div>

            {/* 导航链接 - 桌面端 */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === 'multiVideo' && multiVideoData ? navigateTo('multiVideo') : navigateTo(item.id)}
                  disabled={item.id === 'multiVideo' && !multiVideoData}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentView === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  } ${item.id === 'multiVideo' && !multiVideoData ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* 状态指示 */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">服务正常</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 - 移动端 */}
        <aside className={`lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`w-64 h-full bg-gray-800 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-bold text-lg">导航菜单</h2>
            </div>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === 'multiVideo' && multiVideoData ? navigateTo('multiVideo') : navigateTo(item.id)}
                  disabled={item.id === 'multiVideo' && !multiVideoData}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                    currentView === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  } ${item.id === 'multiVideo' && !multiVideoData ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* 首页视图 */}
          {currentView === 'home' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 欢迎信息 */}
              <div className="bg-gradient-to-r from-primary-600 to-pink-600 rounded-2xl p-8 text-white">
                <h2 className="text-4xl font-bold mb-4">欢迎使用抖音信息采集系统</h2>
                <p className="text-lg opacity-90 mb-6">
                  轻松采集抖音视频、评论、用户信息，支持关键词搜索和批量导出
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigateTo('accounts')}
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    账号管理
                  </button>
                  <button
                    onClick={() => navigateTo('search')}
                    className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    开始搜索
                  </button>
                </div>
              </div>

              {/* 功能卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <User className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cookie 管理</h3>
                  <p className="text-gray-400 mb-4">
                    添加和管理多个抖音账号 Cookie，支持批量操作
                  </p>
                  <button
                    onClick={() => navigateTo('accounts')}
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                  >
                    立即管理 →
                  </button>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all">
                  <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Link2 className="w-7 h-7 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">链接采集</h3>
                  <p className="text-gray-400 mb-4">
                    输入抖音分享链接，自动解析并一键采集评论
                  </p>
                  <button
                    onClick={() => navigateTo('collect')}
                    className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2"
                  >
                    开始采集 →
                  </button>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all">
                  <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">关键词搜索</h3>
                  <p className="text-gray-400 mb-4">
                    输入关键词搜索抖音视频，支持分页和筛选
                  </p>
                  <button
                    onClick={() => navigateTo('search')}
                    className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2"
                  >
                    开始搜索 →
                  </button>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">快速开始</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">添加账号</h4>
                      <p className="text-sm text-gray-400">
                        在账号管理中添加您的抖音 Cookie
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">搜索视频</h4>
                      <p className="text-sm text-gray-400">
                        使用关键词搜索想要采集的视频
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">采集数据</h4>
                      <p className="text-sm text-gray-400">
                        查看视频详情、评论和用户信息
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 账号管理视图 */}
          {currentView === 'accounts' && (
            <div className="animate-fadeIn">
              <CookieManager />
            </div>
          )}

          {/* 链接采集视图 */}
          {currentView === 'collect' && (
            <div className="animate-fadeIn">
              <LinkCollector 
                onViewComments={handleViewComments} 
                onBatchCollect={handleBatchCollect}
                onViewUser={handleViewUser}
                initialUrl={linkCollectorData.url}
                initialResult={linkCollectorData.result}
                initialError={linkCollectorData.error}
                onDataUpdate={(data) => setLinkCollectorData({
                  url: data.url,
                  result: data.result,
                  error: data.error
                })}
              />
            </div>
          )}

          {/* 搜索视图 */}
          {currentView === 'search' && (
            <div className="animate-fadeIn">
              <VideoSearch onVideoSelect={handleVideoSelect} />
            </div>
          )}

          {/* 视频详情视图 */}
          {currentView === 'videoDetail' && selectedVideoId && (
            <div className="animate-fadeIn">
              <VideoDetail
                videoId={selectedVideoId}
                onBack={handleBack}
                onViewComments={handleViewComments}
                onViewUser={handleViewUser}
              />
            </div>
          )}

          {/* 评论视图 */}
          {currentView === 'comments' && selectedVideoId && (
            <div className="animate-fadeIn">
              <CommentSection
                videoId={selectedVideoId}
                onBack={handleBack}
              />
            </div>
          )}

          {/* 多视频采集视图 */}
          {currentView === 'multiVideo' && multiVideoData && (
            <div className="animate-fadeIn">
              <MultiVideoCollector
                videos={multiVideoData}
                onBack={handleBack}
              />
            </div>
          )}

          {/* 用户信息视图 */}
          {currentView === 'user' && (
            <div className="animate-fadeIn">
              <UserInfo 
                userId={selectedUserId} 
                onBack={handleBack} 
                onVideoSelect={handleVideoSelect}
                onBatchCollect={handleBatchCollect}
              />
            </div>
          )}
        </main>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 抖音信息采集系统. 仅供学习和研究使用.
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>服务状态: 正常运行</span>
              <span>|</span>
              <span>后端: http://localhost:8080</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
