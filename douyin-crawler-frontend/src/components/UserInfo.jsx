import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { 
  User, 
  Video, 
  Heart, 
  MessageCircle,
  Play,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Users,
  Star,
  ExternalLink,
  CheckSquare,
  Square,
  Download
} from 'lucide-react';

const UserInfo = ({ userId, onBack, onVideoSelect, onBatchCollect }) => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [exportFileName, setExportFileName] = useState('douyin_user_data');
  const [customSavePath, setCustomSavePath] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(null);

  React.useEffect(() => {
    if (userId) {
      fetchUserInfo();
      fetchAllVideos();
    }
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/douyin/user`, {
        params: {
          id: userId,
          offset: 0,
          limit: 30
        }
      });

      if (response.data.code === 0) {
        setUser(response.data.data.user || {});
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const fetchAllVideos = async () => {
    setLoadingVideos(true);
    let allVideos = [];
    let currentOffset = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        try {
          const response = await axios.get(`${API_BASE}/douyin/user`, {
            params: {
              id: userId,
              offset: currentOffset,
              limit: 30
            }
          });

          if (response.data.code === 0) {
            const newVideos = response.data.data.aweme_list || [];
            allVideos = [...allVideos, ...newVideos];
            setVideos([...allVideos]);
            
            hasMore = newVideos.length === 30;
            currentOffset += 30;
            
            console.log(`已加载 ${allVideos.length} 个作品, hasMore=${hasMore}`);
          } else {
            console.error('API返回错误:', response.data.msg);
            hasMore = false;
          }
        } catch (err) {
          console.error('单次请求失败:', err);
          hasMore = false;
        }
      }
      
      setHasMoreVideos(false);
      console.log('所有作品加载完成，共', allVideos.length, '个');
      
    } catch (error) {
      console.error('获取作品列表失败:', error);
    } finally {
      setLoadingVideos(false);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toString();
  };

  const copyUserUrl = () => {
    if (userId) {
      navigator.clipboard.writeText(`https://www.douyin.com/user/${userId}`);
      alert('用户链接已复制到剪贴板！');
    }
  };

  const toggleVideoSelection = (videoId) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.aweme_id)));
    }
  };

  const handleBatchCollect = () => {
    if (selectedVideos.size === 0) {
      alert('请至少选择一个视频！');
      return;
    }
    
    const selectedVideoData = videos
      .filter(v => selectedVideos.has(v.aweme_id))
      .map(video => ({
        video_id: video.aweme_id,
        detail: {
          aweme_id: video.aweme_id,
          desc: video.desc,
          video: video.video,
          statistics: video.statistics,
          author: video.author
        }
      }));
    
    if (onBatchCollect) {
      onBatchCollect(selectedVideoData);
    }
  };

  const exportData = async (format) => {
    const exportData = {
      user_id: userId,
      user: user,
      videos: videos,
      export_time: new Date().toISOString(),
      total_videos: videos.length
    };

    let content, filename, mimeType;

    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      filename = `${exportFileName}.json`;
      mimeType = 'application/json';
    } else {
      content = convertToCSV(exportData);
      filename = `${exportFileName}.csv`;
      mimeType = 'text/csv';
    }

    try {
      if (customSavePath && selectedDirectory) {
        // 使用 File System Access API 写入到选择的文件夹
        const fileHandle = await selectedDirectory.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        alert(`已成功导出到 ${selectedDirectory.name}/${filename}`);
      } else {
        // 传统下载方式
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`已下载 ${filename}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error.message || '未知错误'}`);
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      '视频ID', '视频描述', '点赞数', '评论数', '分享数', '收藏数', '时长(秒)', '发布时间'
    ];
    
    const rows = data.videos.map(video => [
      video.aweme_id || '',
      `"${(video.desc || '').replace(/"/g, '""')}"`,
      video.statistics?.digg_count || 0,
      video.statistics?.comment_count || 0,
      video.statistics?.share_count || 0,
      video.statistics?.collect_count || 0,
      Math.floor((video.video?.duration || 0) / 1000),
      video.create_time ? new Date(video.create_time * 1000).toLocaleString('zh-CN') : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const selectSavePath = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads'
      });
      setSelectedDirectory(directoryHandle);
    } catch (error) {
      console.log('用户取消选择文件夹');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <button
        onClick={onBack}
        className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      {/* 用户信息卡片 */}
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-500 flex-shrink-0 overflow-hidden">
            {user?.avatar_thumb?.url_list?.[0] || user?.avatar_larger?.url_list?.[0] ? (
              <img src={user.avatar_thumb?.url_list?.[0] || user.avatar_larger?.url_list?.[0]} alt="" className="w-full h-full object-cover" />
            ) : loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {loading && !user?.nickname ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  加载中...
                </span>
              ) : (
                `@${user?.nickname || '未知用户'}`
              )}
            </h2>
            
            {user?.unique_id && (
              <p className="text-gray-400 mb-4">抖音号: {user.unique_id}</p>
            )}
            
            {user?.signature && (
              <p className="text-sm text-gray-300 mb-4">{user.signature}</p>
            )}

            {/* 数据统计 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatNumber(user?.following_count)}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" />
                  关注
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {formatNumber(user?.follower_count)}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" />
                  粉丝
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatNumber(user?.total_favorited)}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3" />
                  获赞
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {formatNumber(user?.aweme_count)}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Video className="w-3 h-3" />
                  作品
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={copyUserUrl}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            复制主页链接
          </button>
          <button
            onClick={fetchAllVideos}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loadingVideos ? 'animate-spin' : ''}`} />
            {loadingVideos ? '加载中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 导出功能 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-gray-300">导出数据</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">文件名称:</label>
            <input
              type="text"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入文件名"
            />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={customSavePath}
              onChange={(e) => setCustomSavePath(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-400">选择保存位置</span>
          </label>
          
          {customSavePath && (
            <div className="flex items-center gap-2">
              <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm min-w-[150px]">
                {selectedDirectory ? selectedDirectory.name : '未选择文件夹'}
              </div>
              <button
                onClick={selectSavePath}
                className="bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-lg text-sm transition-all"
              >
                浏览
              </button>
            </div>
          )}
          
          <button
            onClick={() => exportData('json')}
            disabled={loadingVideos || videos.length === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出JSON
          </button>
          
          <button
            onClick={() => exportData('csv')}
            disabled={loadingVideos || videos.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出CSV
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          导出内容包含：用户信息、所有作品列表（ID、描述、点赞数、评论数、分享数、收藏数、时长、发布时间）
        </p>
      </div>

      {/* 用户ID */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-400 font-medium">用户UID:</span>
          <code className="bg-gray-800 px-3 py-1 rounded">{userId}</code>
        </div>
      </div>

      {/* 作品列表 */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6 text-primary-500" />
              作品列表
              <span className="text-gray-400 text-sm font-normal">
                {loadingVideos ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    加载中... ({videos.length} 个)
                  </span>
                ) : (
                  `(${videos.length} 个作品)`
                )}
              </span>
            </h3>
          </div>
          
          {/* 选择操作按钮 */}
          {videos.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                {selectedVideos.size === videos.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedVideos.size === videos.length ? '取消全选' : '全选'}
              </button>
              
              {selectedVideos.size > 0 && (
                <button
                  onClick={handleBatchCollect}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  采集选中视频 ({selectedVideos.size})
                </button>
              )}
            </div>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-gray-700 rounded-lg">
            {loadingVideos ? (
              <>
                <RefreshCw className="w-16 h-16 mx-auto text-primary-500 mb-4 animate-spin" />
                <p className="text-gray-400">正在加载作品...</p>
              </>
            ) : (
              <>
                <Video className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">暂无作品</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {videos.map((video, index) => (
                <div
                  key={video.aweme_id}
                  className={`bg-gray-700 rounded-lg overflow-hidden transition-all cursor-pointer group relative ${
                    selectedVideos.has(video.aweme_id) ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {/* 复选框 */}
                  <div 
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoSelection(video.aweme_id);
                    }}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      selectedVideos.has(video.aweme_id)
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-800/80 border-gray-400 hover:border-green-400'
                    }`}>
                      {selectedVideos.has(video.aweme_id) && (
                        <CheckSquare className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="relative aspect-video bg-gray-800"
                    onClick={() => onVideoSelect(video.aweme_id)}
                  >
                    {video.video?.cover?.url_list?.[0] ? (
                      <img
                        src={video.video.cover.url_list[0]}
                        alt={video.desc}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                      </div>
                    </div>

                    {video.video?.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        {(() => {
                          const totalSeconds = Math.floor(video.video.duration / 1000);
                          const minutes = Math.floor(totalSeconds / 60);
                          const seconds = totalSeconds % 60;
                          return `${minutes}:${String(seconds).padStart(2, '0')}`;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="p-2" onClick={() => onVideoSelect(video.aweme_id)}>
                    {/* 视频标题 */}
                    {video.desc && (
                      <p className="text-sm text-gray-200 mb-2 line-clamp-2 leading-tight">
                        {video.desc}
                      </p>
                    )}
                    
                    {/* 统计信息 */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(video.statistics?.digg_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(video.statistics?.comment_count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
