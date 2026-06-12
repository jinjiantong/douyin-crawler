import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { 
  MessageCircle, 
  Heart, 
  User, 
  RefreshCw, 
  ChevronDown,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  List,
  Video,
  Clock
} from 'lucide-react';

const MultiVideoCollector = ({ videos, onBack }) => {
  const [collectionStatus, setCollectionStatus] = useState({});
  const [allComments, setAllComments] = useState({});
  const [isCollecting, setIsCollecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPausedRef] = useState({ current: false });
  const [exportPrefix, setExportPrefix] = useState('douyin_multi_comments');
  const [useDirectoryPicker, setUseDirectoryPicker] = useState(false);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const collectAllComments = async () => {
    setIsCollecting(true);
    setCollectionStatus({});
    setAllComments({});

    const initialStatus = {};
    videos.forEach((video, index) => {
      initialStatus[video.video_id] = {
        status: 'pending',
        progress: 0,
        collected: 0,
        total: 0
      };
    });
    setCollectionStatus(initialStatus);

    for (let i = 0; i < videos.length; i++) {
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const video = videos[i];
      setCurrentVideoIndex(i);
      
      await collectVideoComments(video);
    }

    setIsCollecting(false);
    if (!isPausedRef.current) {
      alert('所有视频评论采集完成！');
    }
  };

  const collectVideoComments = async (video) => {
    const videoId = video.video_id;
    
    setCollectionStatus(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], status: 'collecting', progress: 0 }
    }));

    let allCommentsList = [];
    let currentOffset = 0;
    const limit = 50;
    let total = video.detail?.statistics?.comment_count || 0;
    let hasMore = 1;
    let emptyCount = 0;
    const MAX_EMPTY_TRIES = 3;
    let maxRetries = 0;
    const MAX_RETRIES = 3;
    
    console.log(`开始采集视频 ${videoId}，预期总数: ${total}`);
    
    try {
      while (hasMore === 1) {
        while (isPausedRef.current) {
          setCollectionStatus(prev => ({
            ...prev,
            [videoId]: { ...prev[videoId], status: 'paused' }
          }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setCollectionStatus(prev => ({
          ...prev,
          [videoId]: { ...prev[videoId], status: 'collecting' }
        }));

        try {
          const response = await axios.get(`${API_BASE}/douyin/comments`, {
            params: {
              id: videoId,
              offset: currentOffset,
              limit: limit
            }
          });

          if (response.data.code !== 0) {
            console.error(`获取评论失败 (offset=${currentOffset}):`, response.data.msg);
            maxRetries++;
            if (maxRetries >= MAX_RETRIES) {
              console.error(`重试次数达到上限，停止采集`);
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          maxRetries = 0;
          const data = response.data.data;
          const newComments = data.comments || [];
          
          console.log(`请求 offset=${currentOffset}，返回 ${newComments.length} 条评论，has_more=${data.has_more}，当前累计: ${allCommentsList.length}`);
          
          if (data.total > 0) {
            if (total !== data.total) {
              console.log(`total 更新: ${total} -> ${data.total}`);
            }
            total = data.total;
          }
          
          if (!newComments.length) {
            emptyCount++;
            console.log(`空响应 #${emptyCount}，已采集 ${allCommentsList.length} 条`);
            
            if (emptyCount >= MAX_EMPTY_TRIES) {
              console.log(`连续 ${MAX_EMPTY_TRIES} 次空响应，停止采集`);
              break;
            }
            
            currentOffset += limit;
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          
          emptyCount = 0;
          allCommentsList = [...allCommentsList, ...newComments];
          
          hasMore = data.has_more;
          
          const progress = Math.min(100, (allCommentsList.length / (total || allCommentsList.length)) * 100);
          
          setCollectionStatus(prev => ({
            ...prev,
            [videoId]: { 
              ...prev[videoId], 
              progress,
              collected: allCommentsList.length,
              total
            }
          }));

          if (total > 0 && allCommentsList.length >= total) {
            console.log(`已采集 ${allCommentsList.length} 条，达到总数 ${total}`);
            break;
          }
          
          currentOffset += limit;
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`请求异常 (offset=${currentOffset}):`, error.message);
          maxRetries++;
          if (maxRetries >= MAX_RETRIES) {
            console.error(`请求异常次数达到上限，停止采集`);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!isPausedRef.current && allCommentsList.length > 0) {
        setCollectionStatus(prev => ({
          ...prev,
          [videoId]: { ...prev[videoId], status: 'completed', progress: 100 }
        }));
        
        setAllComments(prev => ({
          ...prev,
          [videoId]: {
            video: video,
            comments: allCommentsList,
            total: allCommentsList.length
          }
        }));
      }
    } catch (error) {
      console.error('采集评论失败:', error);
      setCollectionStatus(prev => ({
        ...prev,
        [videoId]: { ...prev[videoId], status: 'error', error: error.message }
      }));
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
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

  const exportAllComments = async (format = 'json') => {
    const allCommentsArray = Object.values(allComments);
    if (allCommentsArray.length === 0) {
      alert('暂无评论可导出');
      return;
    }

    const exportData = allCommentsArray.map(item => ({
      video_id: item.video.video_id,
      video_desc: item.video.detail?.desc || '无标题',
      video_create_time: item.video.detail?.create_time || '',
      video_statistics: {
        digg_count: item.video.detail?.statistics?.digg_count || 0,
        comment_count: item.video.detail?.statistics?.comment_count || 0,
        share_count: item.video.detail?.statistics?.share_count || 0,
        play_count: item.video.detail?.statistics?.play_count || 0,
      },
      author: {
        nickname: item.video.detail?.author?.nickname || '未知',
        uid: item.video.detail?.author?.uid || '',
        sec_uid: item.video.detail?.author?.sec_uid || '',
        signature: item.video.detail?.author?.signature || '',
      },
      comments: item.comments.map(comment => ({
        id: comment.cid,
        content: comment.text || comment.content || '',
        user: {
          nickname: comment.user?.nickname || '未知用户',
          uid: comment.user?.uid || '',
          sec_uid: comment.user?.sec_uid || '',
        },
        like_count: comment.like_count || comment.digg_count || 0,
        create_time: comment.create_time,
        reply_id: comment.reply_id || '',
        reply_to_reply_id: comment.reply_to_reply_id || '',
      }))
    }));

    let content, mimeType, extension;
    
    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else if (format === 'csv') {
      content = '\ufeff视频ID,视频标题,视频发布时间,视频点赞数,视频评论数,视频分享数,视频播放数,主播昵称,主播UID,主播签名,评论ID,评论内容,评论用户,评论用户UID,评论点赞数,评论时间\n';
      exportData.forEach(item => {
        item.comments.forEach(comment => {
          content += `"${item.video_id}","${(item.video_desc || '').replace(/"/g, '""')}","${item.video_create_time}",${item.video_statistics.digg_count},${item.video_statistics.comment_count},${item.video_statistics.share_count},${item.video_statistics.play_count},"${item.author.nickname}","${item.author.uid}","${(item.author.signature || '').replace(/"/g, '""')}","${comment.id}","${(comment.content || '').replace(/"/g, '""')}","${comment.user.nickname}","${comment.user.uid}",${comment.like_count},"${formatDate(comment.create_time)}"\n`;
        });
      });
      mimeType = 'text/csv;charset=utf-8';
      extension = 'csv';
    }

    const filename = `${exportPrefix}_${Date.now()}.${extension}`;

    try {
      if (useDirectoryPicker && window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: format === 'json' ? 'JSON 文件' : 'CSV 文件',
            accept: {
              [mimeType]: [`.${extension}`]
            }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        alert(`已成功导出 ${allCommentsArray.length} 个视频的评论到指定位置！`);
      } else {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        alert(`已导出 ${allCommentsArray.length} 个视频的评论到浏览器默认下载目录！`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
      } else {
        console.error('导出失败:', error);
        alert('导出失败: ' + error.message);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'collecting':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold">多视频评论采集</h2>
            <span className="text-gray-400 text-sm">
              {videos.length} 个视频
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
            <label className="text-gray-400 text-sm whitespace-nowrap">文件名前缀:</label>
            <input
              type="text"
              value={exportPrefix}
              onChange={(e) => setExportPrefix(e.target.value)}
              placeholder="输入文件名前缀"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 w-48 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              id="useDirectoryPicker"
              checked={useDirectoryPicker}
              onChange={(e) => setUseDirectoryPicker(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <label htmlFor="useDirectoryPicker" className="text-gray-400 text-sm cursor-pointer">
              选择保存位置
            </label>
          </div>
          
          <button
            onClick={() => exportAllComments('json')}
            disabled={Object.keys(allComments).length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            导出JSON
          </button>
          <button
            onClick={() => exportAllComments('csv')}
            disabled={Object.keys(allComments).length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            导出CSV
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={collectAllComments}
          disabled={isCollecting}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isCollecting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              开始全量采集
            </>
          )}
        </button>
        
        {isCollecting && (
          <button
            onClick={togglePause}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isPaused 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                继续
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                暂停
              </>
            )}
          </button>
        )}
      </div>

      {isCollecting && (
        <div className="mb-6 bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">总体进度</span>
            <span className="text-purple-500">
              {Object.values(collectionStatus).filter(s => s.status === 'completed').length} / {videos.length} 个视频
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${isPaused ? 'bg-yellow-500' : 'bg-purple-500'}`}
              style={{ 
                width: `${(Object.values(collectionStatus).filter(s => s.status === 'completed').length / videos.length) * 100}%` 
              }}
            />
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {isPaused ? '采集已暂停' : `正在采集第 ${currentVideoIndex + 1} 个视频...`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {videos.map((video, index) => {
          const status = collectionStatus[video.video_id] || {};
          return (
            <div key={video.video_id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {video.detail?.video?.cover?.url_list?.[0] && (
                  <img
                    src={video.detail.video.cover.url_list[0]}
                    alt="封面"
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 text-sm">#{index + 1}</span>
                    {getStatusIcon(status.status)}
                    <h3 className="font-semibold truncate flex-1">
                      {video.detail?.desc || video.video_id}
                    </h3>
                  </div>
                  
                  {video.detail?.author && (
                    <p className="text-sm text-gray-400 mb-2">
                      作者: {video.detail.author.nickname}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>评论数: {formatNumber(video.detail?.statistics?.comment_count)}</span>
                    <span>已采集: {status.collected || 0}</span>
                  </div>

                  {status.status === 'collecting' && (
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${status.progress || 0}%` }}
                      />
                    </div>
                  )}

                  {status.error && (
                    <p className="text-sm text-red-400 mt-1">
                      错误: {status.error}
                    </p>
                  )}
                </div>
              </div>

              {allComments[video.video_id] && allComments[video.video_id].comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-sm text-gray-400 mb-2">
                    已采集评论预览（前10条）:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allComments[video.video_id].comments.slice(0, 10).map((comment, cIndex) => (
                      <div key={comment.cid || cIndex} className="text-sm bg-gray-600/50 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-blue-400">
                            {comment.user?.nickname || '未知用户'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.create_time)}
                          </span>
                        </div>
                        <p className="text-gray-300">
                          {comment.text || comment.content || ''}
                        </p>
                      </div>
                    ))}
                    {allComments[video.video_id].comments.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... 还有 {allComments[video.video_id].comments.length - 10} 条评论
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiVideoCollector;
