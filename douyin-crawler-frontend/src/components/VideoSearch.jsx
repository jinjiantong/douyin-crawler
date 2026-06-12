import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { Search, Play, Heart, MessageCircle, Share2, User, RefreshCw } from 'lucide-react';

const VideoSearch = ({ onVideoSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const searchVideos = async (loadMore = false) => {
    if (!keyword.trim()) {
      alert('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const offset = loadMore ? page * 20 : 0;
      const response = await axios.get(`${API_BASE}/douyin/search`, {
        params: {
          keyword: keyword,
          offset: offset,
          limit: 20
        }
      });

      if (response.data.code === 0) {
        const newVideos = response.data.data || [];
        if (loadMore) {
          setVideos([...videos, ...newVideos]);
        } else {
          setVideos(newVideos);
        }
        setHasMore(newVideos.length === 20);
        setPage(loadMore ? page + 1 : 1);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-bold">关键词搜索视频</h2>
      </div>

      {/* 搜索框 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          placeholder="输入关键词搜索视频..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <button
          onClick={() => searchVideos()}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          搜索
        </button>
      </div>

      {/* 搜索结果 */}
      {loading && videos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      ) : !hasSearched ? (
        <div className="text-center py-20">
          <Search className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">输入关键词开始搜索</p>
          <p className="text-gray-500 text-sm mt-2">例如: 美食、旅游、搞笑</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">未找到相关视频</p>
          <p className="text-gray-500 text-sm mt-2">尝试其他关键词</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <div
                key={`${video.aweme_id}-${index}`}
                onClick={() => onVideoSelect(video.aweme_id)}
                className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-all cursor-pointer group animate-fadeIn hover:scale-105 hover:shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* 视频封面 */}
                <div className="relative aspect-video bg-gray-800">
                  {video.video_meta?.cover_url ? (
                    <img
                      src={video.video_meta.cover_url}
                      alt={video.desc}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gray-700 flex items-center justify-center"
                    style={{ display: video.video_meta?.cover_url ? 'none' : 'flex' }}
                  >
                    <Play className="w-12 h-12 text-gray-500" />
                  </div>
                  
                  {/* 播放图标 */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </div>

                  {/* 时长 */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* 视频信息 */}
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {video.desc || '无描述'}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(video.like_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(video.comment_count)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {formatNumber(video.share_count)}
                    </span>
                  </div>

                  {/* 作者信息 */}
                  {video.author?.nickname && (
                    <div className="mt-2 pt-2 border-t border-gray-600 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-gray-300 truncate">
                        @{video.author.nickname}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => searchVideos(true)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    加载更多
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoSearch;
