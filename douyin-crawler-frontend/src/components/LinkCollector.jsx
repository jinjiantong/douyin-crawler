import React, { useState } from 'react';
import axios from 'axios';
import { Link2, ArrowRight, AlertCircle, CheckCircle, Video, MessageCircle, User, Loader2, Plus, Trash2, List, Search } from 'lucide-react';

const API_BASE = 'http://localhost:8080';

const LinkCollector = ({ 
  onViewComments, 
  onBatchCollect,
  onViewUser,
  initialUrl = '', 
  initialResult = null, 
  initialError = '',
  onDataUpdate
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState(initialError);
  const [collecting, setCollecting] = useState(false);
  const [displayedComments, setDisplayedComments] = useState(20);  // 初始显示20条评论
  
  // 批量采集相关状态
  const [batchMode, setBatchMode] = useState(false);  // 是否为批量模式
  const [urls, setUrls] = useState(['']);  // 多条链接
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [batchParsing, setBatchParsing] = useState(false);
  
  // 主播ID查询相关状态
  const [userIdMode, setUserIdMode] = useState(false);  // 是否为用户ID查询模式
  const [userId, setUserId] = useState('');  // 用户ID
  const [userLoading, setUserLoading] = useState(false);
  
  // 当数据变化时通知父组件
  const notifyDataUpdate = (newUrl, newResult, newError) => {
    if (onDataUpdate) {
      onDataUpdate({
        url: newUrl,
        result: newResult,
        error: newError
      });
    }
  };

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入抖音分享链接');
      notifyDataUpdate(url, result, '请输入抖音分享链接');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    notifyDataUpdate(url, null, '');

    try {
      const response = await axios.post(`${API_BASE}/douyin/parse`, { url: url.trim() });

      if (response.data.code === 0) {
        setResult(response.data.data);
        notifyDataUpdate(url, response.data.data, '');
      } else {
        const errMsg = response.data.msg || '解析失败';
        setError(errMsg);
        notifyDataUpdate(url, null, errMsg);
      }
    } catch (err) {
      console.error('解析链接失败:', err);
      const errMsg = err.response?.data?.msg || '网络错误，请检查后端服务';
      setError(errMsg);
      notifyDataUpdate(url, null, errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    if (!url.trim()) {
      setError('请输入抖音分享链接');
      notifyDataUpdate(url, result, '请输入抖音分享链接');
      return;
    }

    setCollecting(true);
    setError('');
    setDisplayedComments(20);  // 重置显示的评论数量
    notifyDataUpdate(url, result, '');

    try {
      const response = await axios.post(`${API_BASE}/douyin/collect`, { 
        url: url.trim(),
        offset: 0,
        limit: 500  // 请求采集500条评论
      });

      if (response.data.code === 0) {
        setResult(response.data.data);
        notifyDataUpdate(url, response.data.data, '');
      } else {
        const errMsg = response.data.msg || '采集失败';
        setError(errMsg);
        notifyDataUpdate(url, result, errMsg);
      }
    } catch (err) {
      console.error('采集失败:', err);
      const errMsg = err.response?.data?.msg || '网络错误，请检查后端服务';
      setError(errMsg);
      notifyDataUpdate(url, result, errMsg);
    } finally {
      setCollecting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCollect();
    }
  };

  // 批量采集相关函数
  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    setBatchError('');
  };

  const addUrlInput = () => {
    if (urls.length < 10) {
      setUrls([...urls, '']);
    }
  };

  const removeUrlInput = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const handleBatchParse = async () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length === 0) {
      setBatchError('请至少输入一条链接');
      return;
    }

    setBatchParsing(true);
    setBatchError('');

    try {
      const parsedResults = [];
      for (const urlItem of validUrls) {
        try {
          const response = await axios.post(`${API_BASE}/douyin/parse`, { url: urlItem.trim() });
          if (response.data.code === 0) {
            parsedResults.push({
              url: urlItem,
              data: response.data.data,
              success: true
            });
          } else {
            parsedResults.push({
              url: urlItem,
              error: response.data.msg || '解析失败',
              success: false
            });
          }
        } catch (err) {
          parsedResults.push({
            url: urlItem,
            error: '网络错误',
            success: false
          });
        }
      }

      const successfulResults = parsedResults.filter(r => r.success);
      if (successfulResults.length === 0) {
        setBatchError('所有链接解析失败');
      } else {
        setBatchError('');
        if (onBatchCollect) {
          onBatchCollect(successfulResults.map(r => r.data));
        }
      }
    } catch (err) {
      setBatchError('批量解析失败');
    } finally {
      setBatchParsing(false);
    }
  };

  const handleBatchCollect = async () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length === 0) {
      setBatchError('请至少输入一条链接');
      return;
    }

    setBatchLoading(true);
    setBatchError('');

    try {
      const collectedResults = [];
      for (const urlItem of validUrls) {
        try {
          const response = await axios.post(`${API_BASE}/douyin/collect`, { 
            url: urlItem.trim(),
            offset: 0,
            limit: 500
          });
          if (response.data.code === 0) {
            collectedResults.push({
              url: urlItem,
              data: response.data.data,
              success: true
            });
          } else {
            collectedResults.push({
              url: urlItem,
              error: response.data.msg || '采集失败',
              success: false
            });
          }
        } catch (err) {
          collectedResults.push({
            url: urlItem,
            error: '网络错误',
            success: false
          });
        }
      }

      const successfulResults = collectedResults.filter(r => r.success);
      if (successfulResults.length === 0) {
        setBatchError('所有视频采集失败');
      } else {
        setBatchError('');
        if (onBatchCollect) {
          onBatchCollect(successfulResults.map(r => r.data));
        }
      }
    } catch (err) {
      setBatchError('批量采集失败');
    } finally {
      setBatchLoading(false);
    }
  };

  const extractSecUserId = (input) => {
    // 如果输入本身就是 sec_user_id 格式
    if (input.startsWith('MS4wLjABAAA')) {
      return input.trim();
    }
    
    // 如果是 URL 格式，尝试从中提取 sec_user_id
    try {
      const url = new URL(input);
      
      // 尝试从路径中提取（如 /user/xxx）
      const pathParts = url.pathname.split('/');
      const userPathIndex = pathParts.indexOf('user');
      if (userPathIndex !== -1 && pathParts[userPathIndex + 1]) {
        const possibleId = pathParts[userPathIndex + 1];
        if (possibleId.startsWith('MS4wLjABAAA')) {
          return possibleId;
        }
      }
      
      // 尝试从查询参数中提取
      const secUserIdFromQuery = url.searchParams.get('sec_user_id');
      if (secUserIdFromQuery && secUserIdFromQuery.startsWith('MS4wLjABAAA')) {
        return secUserIdFromQuery;
      }
    } catch (e) {
      // 如果不是有效的URL，继续尝试其他方法
    }
    
    // 如果包含 sec_user_id= 的格式，尝试提取
    const secUserIdMatch = input.match(/sec_user_id=([^&]+)/);
    if (secUserIdMatch && secUserIdMatch[1].startsWith('MS4wLjABAAA')) {
      return secUserIdMatch[1];
    }
    
    // 如果都没有，直接返回输入（可能用户已经正确输入了ID）
    return input.trim();
  };

  const handleUserQuery = () => {
    if (!userId.trim()) {
      alert('请输入主播ID或主页地址');
      return;
    }
    
    // 提取 sec_user_id
    const secUserId = extractSecUserId(userId);
    
    if (!secUserId.startsWith('MS4wLjABAAA')) {
      alert('未能从输入中提取有效的主播ID，请检查输入是否正确');
      return;
    }
    
    // 调用父组件的函数，跳转到用户信息页面
    if (onViewUser) {
      onViewUser(secUserId);
    }
  };

  const formatCommentCount = (count) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count?.toString() || '0';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Link2 className="w-8 h-8 text-orange-400" />
          抖音链接采集
        </h1>
        <p className="text-gray-400">
          输入抖音分享链接，一键解析并采集视频评论
        </p>
      </div>

      {/* 输入区域 */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">输入链接</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              抖音分享链接或视频ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => { 
                  const newUrl = e.target.value; 
                  setUrl(newUrl); 
                  setError(''); 
                  notifyDataUpdate(newUrl, result, '');
                }}
                onKeyPress={handleKeyPress}
                placeholder="粘贴抖音分享链接或直接输入视频ID..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleParse}
              disabled={loading || collecting}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              解析链接
            </button>

            <button
              onClick={handleCollect}
              disabled={loading || collecting}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {collecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              开始采集评论
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* 批量采集区域 */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List className="w-5 h-5 text-purple-400" />
            批量采集（最多10条）
          </h2>
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              batchMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {batchMode ? '收起批量采集' : '启用批量采集'}
          </button>
        </div>

        {batchMode && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-gray-400">
              输入多条抖音链接，点击"解析链接"可预览视频信息，点击"开始采集"将跳转至多视频评论采集页面
            </p>
            
            <div className="space-y-3">
              {urls.map((urlItem, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-500 text-sm py-3 w-8 text-center">{index + 1}.</span>
                  <input
                    type="text"
                    value={urlItem}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="粘贴抖音分享链接或输入视频ID..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlInput(index)}
                      className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="删除此链接"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              {urls.length < 10 && (
                <button
                  onClick={addUrlInput}
                  disabled={batchLoading || batchParsing}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-all disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  添加链接
                </button>
              )}
              <span className="text-sm text-gray-500">
                {urls.filter(u => u.trim()).length} / 10 条链接
              </span>
            </div>

            <div className="flex gap-3 flex-wrap pt-2">
              <button
                onClick={handleBatchParse}
                disabled={batchLoading || batchParsing || urls.filter(u => u.trim()).length === 0}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {batchParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                解析链接
              </button>

              <button
                onClick={handleBatchCollect}
                disabled={batchLoading || batchParsing || urls.filter(u => u.trim()).length === 0}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {batchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                开始采集评论
              </button>
            </div>

            {batchError && (
              <div className="mt-4 flex items-start gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{batchError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 主播ID查询区域 */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-green-400" />
            主播视频采集
          </h2>
          <button
            onClick={() => setUserIdMode(!userIdMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              userIdMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {userIdMode ? '收起' : '展开'}
          </button>
        </div>

        {userIdMode && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-gray-400">
              输入主播主页地址或 sec_user_id，获取该主播的所有发布视频，方便批量采集评论
            </p>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="输入主播主页地址或 sec_user_id..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-all"
              />
              <button
                onClick={handleUserQuery}
                disabled={!userId.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                查询
              </button>
            </div>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-green-400 mb-2">✅ 使用说明</h4>
              <p className="text-sm text-gray-300">
                支持直接粘贴主播主页地址，系统会自动提取用户标识！
              </p>
              <div className="mt-2 text-xs text-gray-400 bg-gray-800 p-2 rounded font-mono">
                https://www.douyin.com/user/MS4wLjABAAAAwbbVuf1W2DdgRe0xCa0oxg1ZIHbzuiTzyjq3NcOVgBuu6qIidYlMYqbL3ZFY2swu
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2">如何获取主播主页地址?</h4>
              <ol className="text-sm text-gray-400 space-y-2">
                <li>1. 使用浏览器打开抖音网页版</li>
                <li>2. 进入主播的个人主页</li>
                <li>3. 复制浏览器地址栏中的完整URL</li>
                <li>4. 粘贴到上方输入框中点击查询即可</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* 视频信息 */}
          {result.detail && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-400" />
                视频信息
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                {result.detail.video?.cover?.url_list && (
                  <div className="flex-shrink-0">
                    <img
                      src={result.detail.video.cover.url_list?.[0] || ''}
                      alt="视频封面"
                      className="w-48 h-27 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {result.detail.desc || '无标题'}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatCommentCount(result.detail.statistics?.comment_count)} 条评论
                    </span>
                  </div>
                  {result.detail.author && (
                    <div className="flex items-center gap-3">
                      <img
                        src={result.detail.author.avatar_thumb?.url_list?.[0] || ''}
                        alt="作者头像"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{result.detail.author.nickname}</p>
                        <p className="text-sm text-gray-500">@{result.detail.author.unique_id || result.detail.author.short_id}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => onViewComments(result.video_id)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      查看所有评论
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 评论展示 */}
          {result.comments && result.comments.comments && result.comments.comments.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                评论列表 (共 {result.comments.comments.length} 条)
              </h2>
              <div className="space-y-4">
                {result.comments.comments.slice(0, displayedComments).map((comment, index) => {
                  const nickname = comment.user?.nickname || '匿名用户';
                  const avatarUrl = comment.user?.avatar_thumb?.url_list?.[0] || '';
                  
                  return (
                    <div key={comment.cid || index} className="border-b border-gray-700 pb-4 last:border-0">
                      <div className="flex gap-3">
                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            alt={nickname}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{nickname}</span>
                            <span className="text-sm text-gray-500">
                              {comment.create_time ? new Date(comment.create_time * 1000).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{comment.text}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>👍 {comment.digg_count || 0}</span>
                            {(comment.reply_comment_total || 0) > 0 && (
                              <span>💬 {comment.reply_comment_total} 条回复</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 加载更多按钮 */}
              {displayedComments < result.comments.comments.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDisplayedComments(prev => Math.min(prev + 20, result.comments.comments.length))}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition-all"
                  >
                    加载更多 ({displayedComments}/{result.comments.comments.length})
                  </button>
                </div>
              )}
              
              {/* 查看全部按钮 */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => onViewComments(result.video_id)}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  在完整评论页面查看 →
                </button>
              </div>
            </div>
          )}

          {/* 解析信息 */}
          {!result.detail && !result.comments && result.video_id && (
            <div className="bg-gray-800 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-lg font-semibold">解析成功</h2>
              </div>
              <div className="text-gray-400 space-y-2">
                <p>视频ID: <span className="text-white font-mono">{result.video_id}</span></p>
                <p>原始链接: <span className="text-orange-400 break-all">{result.original_url}</span></p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => onViewComments(result.video_id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  查看评论
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-gray-800 rounded-xl p-6 mt-8">
        <h3 className="font-semibold mb-3">支持的链接格式</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• 短链接: <code>https://v.douyin.com/xxxxx/</code></li>
          <li>• 移动端链接: <code>https://www.iesdouyin.com/video/视频ID</code></li>
          <li>• 网页端链接: <code>https://www.douyin.com/video/视频ID</code></li>
          <li>• 直接输入: <code>7375004964311010598</code> (纯视频ID)</li>
        </ul>
      </div>
    </div>
  );
};

export default LinkCollector;
