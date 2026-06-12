import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { 
  Video, 
  Heart, 
  MessageCircle, 
  Share2, 
  User, 
  Calendar,
  Download,
  ExternalLink,
  RefreshCw,
  Play,
  Clock,
  Star
} from 'lucide-react';

const VideoDetail = ({ videoId, onBack, onViewComments, onViewUser }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  const fetchVideoDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/douyin/detail`, {
        params: { id: videoId }
      });

      if (response.data.code === 0) {
        setVideo(response.data.data);
      } else {
        setError(response.data.msg || '获取视频详情失败');
      }
    } catch (error) {
      console.error('获取视频详情失败:', error);
      setError('获取视频详情失败，请检查后端服务');
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

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  const copyVideoUrl = () => {
    if (video?.aweme_id) {
      navigator.clipboard.writeText(`https://www.douyin.com/video/${video.aweme_id}`);
      alert('链接已复制到剪贴板！');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <button
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white flex items-center gap-2"
        >
          ← 返回列表
        </button>
        <div className="text-center py-20">
          <Video className="w-20 h-20 mx-auto text-red-500 mb-4" />
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchVideoDetail}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <button
        onClick={onBack}
        className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition-all"
      >
        ← 返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 视频播放器 */}
        <div className="relative">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {video.video_meta?.play_addr?.url_list?.[0] ? (
              <video
                src={video.video_meta.play_addr.url_list[0]}
                controls
                className="w-full h-full"
                poster={video.video_meta.cover_url}
              />
            ) : video.video_meta?.cover_url ? (
              <img
                src={video.video_meta.cover_url}
                alt={video.desc}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-20 h-20 text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* 视频信息 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{video.desc || '无描述'}</h2>

          {/* 作者信息 */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-600 -m-4 p-4 rounded-lg transition-all"
              onClick={() => onViewUser(video.author?.uid)}
            >
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
                {video.author?.avatar_url ? (
                  <img src={video.author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">@{video.author?.nickname || '未知用户'}</h3>
                <p className="text-sm text-gray-400">
                  {video.author?.follower_count ? `${formatNumber(video.author.follower_count)} 粉丝` : ''}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
              <div className="text-lg font-bold">{formatNumber(video.like_count)}</div>
              <div className="text-xs text-gray-400">点赞</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold">{formatNumber(video.comment_count)}</div>
              <div className="text-xs text-gray-400">评论</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Share2 className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold">{formatNumber(video.share_count)}</div>
              <div className="text-xs text-gray-400">分享</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-lg font-bold">{formatNumber(video.collect_count)}</div>
              <div className="text-xs text-gray-400">收藏</div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gray-400" />
              <span>视频ID: <code className="bg-gray-800 px-2 py-0.5 rounded">{video.aweme_id}</code></span>
            </div>
            {video.create_time && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>发布时间: {formatDate(video.create_time)}</span>
              </div>
            )}
            {video.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>时长: {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={copyVideoUrl}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              复制链接
            </button>
            <button
              onClick={() => onViewComments(video.aweme_id)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              查看评论
            </button>
          </div>
        </div>
      </div>

      {/* 额外信息 */}
      {video.music_info && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Video className="w-5 h-5" />
            视频音乐
          </h3>
          <div className="flex items-center gap-3">
            {video.music_info.thumb_url && (
              <img src={video.music_info.thumb_url} alt="" className="w-12 h-12 rounded-lg" />
            )}
            <div>
              <div className="font-medium">{video.music_info.title || '原声'}</div>
              <div className="text-sm text-gray-400">@{video.music_info.author || '未知'}</div>
            </div>
          </div>
        </div>
      )}

      {/* 标签 */}
      {video.text_extra && video.text_extra.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">相关话题</h3>
          <div className="flex flex-wrap gap-2">
            {video.text_extra.map((tag, index) => (
              tag.hashtag_name && (
                <span
                  key={index}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-500/30 transition-all"
                >
                  #{tag.hashtag_name}
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
