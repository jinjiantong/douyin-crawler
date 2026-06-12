import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { 
  MessageCircle, 
  Heart, 
  User, 
  RefreshCw, 
  ChevronDown,
  Download,
  Reply,
  ArrowLeft
} from 'lucide-react';

const CommentSection = ({ videoId, onBack }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullCollecting, setIsFullCollecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = React.useRef(isPaused);
  React.useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const [loadingReplies, setLoadingReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replies, setReplies] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [collectedComments, setCollectedComments] = useState([]);
  const [collectProgress, setCollectProgress] = useState(0);

  const fetchComments = async (loadMore = false) => {
    if (!hasMore && loadMore) return;

    setLoading(true);
    
    try {
      const currentOffset = loadMore ? offset + 50 : 0;
      const response = await axios.get(`${API_BASE}/douyin/comments`, {
        params: {
          id: videoId,
          offset: currentOffset,
          limit: 50
        }
      });

      if (response.data.code === 0) {
        const data = response.data.data;
        const newComments = data.comments || [];
        
        if (loadMore) {
          setComments([...comments, ...newComments]);
          setCollectedComments([...collectedComments, ...newComments]);
        } else {
          setComments(newComments);
          setCollectedComments(newComments);
        }
        
        setTotalComments(data.total || 0);
        setHasMore(newComments.length === 50);
        setOffset(currentOffset);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      alert('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 全量采集评论
  const fetchAllComments = async () => {
    setIsFullCollecting(true);
    setIsPaused(false);
    setComments([]);
    setCollectedComments([]);
    setOffset(0);
    setHasMore(true);
    setCollectProgress(0);
    
    let allComments = [];
    let currentOffset = 0;
    const limit = 50;
    
    try {
      while (true) {
        // 检查是否暂停
        while (isPausedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const response = await axios.get(`${API_BASE}/douyin/comments`, {
          params: {
            id: videoId,
            offset: currentOffset,
            limit: limit
          }
        });

        if (response.data.code !== 0) {
          console.error('获取评论失败:', response.data.msg);
          break;
        }

        const data = response.data.data;
        const newComments = data.comments || [];
        
        if (!newComments.length) {
          break;
        }
        
        allComments = [...allComments, ...newComments];
        setComments(allComments);
        setCollectedComments(allComments);
        setTotalComments(data.total || allComments.length);
        setCollectProgress(Math.min(100, (allComments.length / (data.total || allComments.length)) * 100));
        
        if (newComments.length < limit) {
          break;
        }
        
        currentOffset += limit;
        
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setHasMore(false);
      setOffset(currentOffset);
      if (!isPaused) {
        alert(`全量采集完成！共采集 ${allComments.length} 条评论`);
      }
    } catch (error) {
      console.error('全量采集评论失败:', error);
      if (!isPaused) {
        alert(`采集失败: ${error.message || '未知错误'}`);
      }
    } finally {
      setIsFullCollecting(false);
      setLoading(false);
    }
  };

  // 暂停采集
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const fetchReplies = async (commentId) => {
    if (replies[commentId]) {
      setReplyingTo(replyingTo === commentId ? null : commentId);
      return;
    }

    setLoadingReplies({ ...loadingReplies, [commentId]: true });
    
    try {
      const response = await axios.get(`${API_BASE}/douyin/replys`, {
        params: {
          id: videoId,
          comment_id: commentId,
          offset: 0,
          limit: 50
        }
      });

      if (response.data.code === 0) {
        const newReplies = response.data.data.comments || [];
        setReplies({ ...replies, [commentId]: newReplies });
        setReplyingTo(commentId);
      }
    } catch (error) {
      console.error('获取回复失败:', error);
    } finally {
      setLoadingReplies({ ...loadingReplies, [commentId]: false });
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toString();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const exportComments = (format = 'json') => {
    if (collectedComments.length === 0) {
      alert('暂无评论可导出');
      return;
    }

    const exportData = collectedComments.map(comment => ({
      id: comment.cid,
      content: comment.text || comment.content || '',
      user: {
        nickname: comment.user?.nickname || '未知用户',
        uid: comment.user?.uid || '',
        avatar: comment.user?.avatar_url || ''
      },
      like_count: comment.like_count || comment.digg_count || 0,
      create_time: comment.create_time,
      reply_count: comment.reply_count || 0,
      replies: replies[comment.cid] || []
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `douyin_comments_${videoId}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['评论ID', '内容', '用户', '点赞数', '时间', '回复数'];
      const rows = exportData.map(c => [
        c.id,
        c.content.replace(/"/g, '""'),
        c.user.nickname,
        c.like_count,
        formatDate(c.create_time),
        c.reply_count
      ]);
      
      let csv = '\ufeff' + headers.join(',') + '\n';
      rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `douyin_comments_${videoId}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    alert(`已导出 ${collectedComments.length} 条评论`);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold">评论采集</h2>
            <span className="text-gray-400 text-sm">
              共 {totalComments > 0 ? formatNumber(totalComments) : '?'} 条
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => exportComments('json')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            导出JSON
          </button>
          <button
            onClick={() => exportComments('csv')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            导出CSV
          </button>
        </div>
      </div>

      {/* 采集按钮 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => fetchComments(false)}
          disabled={loading || isFullCollecting}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading && !comments.length ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              {comments.length > 0 ? '刷新评论' : '开始采集评论'}
            </>
          )}
        </button>
        
        <button
          onClick={fetchAllComments}
          disabled={loading || isFullCollecting || !videoId}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isFullCollecting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              全量采集
            </>
          )}
        </button>
      </div>

      {/* 全量采集进度 */}
      {isFullCollecting && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">采集进度</span>
            <span className="text-primary-500">{Math.round(collectProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${isPaused ? 'bg-yellow-500' : 'bg-primary-500'}`}
              style={{ width: `${collectProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <p className="text-gray-500 text-sm">
              {isPaused ? '采集已暂停' : '正在采集评论...'} (已采集 {collectedComments.length} 条)
            </p>
            <button
              onClick={togglePause}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isPaused ? '继续采集' : '暂停采集'}
            </button>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {collectedComments.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">已采集评论数</span>
            <span className="text-2xl font-bold text-primary-500">
              {collectedComments.length}
            </span>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">点击"开始采集评论"按钮</p>
          <p className="text-gray-500 text-sm mt-2">系统将自动采集该视频的评论</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.cid}
                className="bg-gray-700 rounded-lg p-4 animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* 主评论 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex-shrink-0 overflow-hidden">
                    {comment.user?.avatar_url ? (
                      <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.user?.nickname || '未知用户'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.create_time)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2 whitespace-pre-wrap">
                      {comment.text || comment.content || ''}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Heart className="w-4 h-4" />
                        {formatNumber(comment.like_count)}
                      </span>
                      
                      {comment.reply_count > 0 && (
                        <button
                          onClick={() => fetchReplies(comment.cid)}
                          disabled={loadingReplies[comment.cid]}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-all"
                        >
                          {loadingReplies[comment.cid] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <ChevronDown className={`w-4 h-4 transition-transform ${replyingTo === comment.cid ? 'rotate-180' : ''}`} />
                          )}
                          {comment.reply_count} 条回复
                        </button>
                      )}
                    </div>

                    {/* 回复列表 */}
                    {replyingTo === comment.cid && replies[comment.cid] && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-600 space-y-3">
                        {replies[comment.cid].map((reply) => (
                          <div key={reply.cid} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 overflow-hidden">
                              {reply.user?.avatar_url ? (
                                <img src={reply.user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-xs">
                                  {reply.user?.nickname || '未知用户'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(reply.create_time)}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{reply.text || reply.content || ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => fetchComments(true)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    加载更多
                  </>
                )}
              </button>
              <p className="text-gray-400 text-sm mt-2">
                已加载 {collectedComments.length} 条评论
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
