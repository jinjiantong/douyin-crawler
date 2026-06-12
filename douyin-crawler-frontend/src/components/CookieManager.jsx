import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Copy, 
  RefreshCw,
  Cookie,
  Monitor,
  Loader,
  AlertCircle
} from 'lucide-react';

const CookieManager = ({ onAccountsChange }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ id: '', cookie: '' });
  const [copiedId, setCopiedId] = useState(null);
  const [fetchingCookie, setFetchingCookie] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 定期检查 Cookie 获取状态
  useEffect(() => {
    if (!fetchingCookie) return;

    const checkInterval = setInterval(async () => {
      try {
        // 检查是否有新 Cookie
        const response = await axios.get('http://localhost:8080/cookie/check');
        
        if (response.data.code === 0 && response.data.data) {
          // 成功获取到 Cookie
          setFetchingCookie(false);
          setFetchStatus('success');
          
          // 自动填充到表单
          const cookie = response.data.data.cookie;
          setNewAccount(prev => ({ ...prev, cookie }));
          
          alert('✅ Cookie 获取成功！请输入账号名称后添加');
          clearInterval(checkInterval);
        } else if (response.data.data?.status === 'login_success') {
          setFetchStatus('login_success');
        }
      } catch (error) {
        console.error('检查 Cookie 状态失败:', error);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [fetchingCookie]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/douyin/account_list`);
      if (response.data.code === 0) {
        setAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error('获取账号列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAutoFetch = async () => {
    if (fetchingCookie) {
      alert('正在获取 Cookie 中，请稍候...');
      return;
    }

    setFetchingCookie(true);
    setFetchStatus('opening');

    try {
      const response = await axios.post('http://localhost:8080/cookie/fetch');
      
      if (response.data.code === 0) {
        setFetchStatus('waiting');
        console.log('浏览器已启动，请在弹出的窗口中完成抖音登录');
      } else {
        alert(`启动失败: ${response.data.msg}`);
        setFetchingCookie(false);
        setFetchStatus('');
      }
    } catch (error) {
      console.error('启动自动获取失败:', error);
      alert('启动失败，请检查后端服务是否运行');
      setFetchingCookie(false);
      setFetchStatus('');
    }
  };

  const cancelFetch = async () => {
    try {
      await axios.post('http://localhost:8080/cookie/cancel');
      setFetchingCookie(false);
      setFetchStatus('');
    } catch (error) {
      console.error('取消失败:', error);
    }
  };

  const addAccount = async () => {
    if (!newAccount.id || !newAccount.cookie) {
      alert('请填写账号名称和 Cookie');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/douyin/add_account`, {
        id: newAccount.id,
        cookie: newAccount.cookie
      });

      if (response.data.code === 0) {
        alert('账号添加成功！');
        setShowAddModal(false);
        setNewAccount({ id: '', cookie: '' });
        fetchAccounts();
        if (onAccountsChange) onAccountsChange();
      } else {
        alert(`添加失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('添加账号失败:', error);
      alert('添加账号失败，请检查后端服务是否运行');
    }
  };

  const markAccountExpired = async (accountId) => {
    if (!confirm(`确定要标记账号 "${accountId}" 为过期吗？`)) return;

    try {
      const response = await axios.post(`${API_BASE}/douyin/expire_account`, {
        id: accountId
      });

      if (response.data.code === 0) {
        alert('账号已标记为过期');
        fetchAccounts();
        if (onAccountsChange) onAccountsChange();
      }
    } catch (error) {
      console.error('标记过期失败:', error);
    }
  };

  const removeAccount = async (accountId) => {
    if (!confirm(`确定要永久删除账号 "${accountId}" 吗？此操作不可恢复！`)) return;

    try {
      const response = await axios.post(`${API_BASE}/douyin/remove_account`, {
        id: accountId
      });

      if (response.data.code === 0) {
        alert('账号已删除');
        fetchAccounts();
        if (onAccountsChange) onAccountsChange();
      }
    } catch (error) {
      console.error('删除账号失败:', error);
      alert('删除账号失败，请检查后端服务是否运行');
    }
  };

  const copyCookie = (cookie, id) => {
    navigator.clipboard.writeText(cookie);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  const getFetchStatusMessage = () => {
    switch (fetchStatus) {
      case 'opening':
        return '正在打开浏览器...';
      case 'waiting':
        return '等待登录中...';
      case 'login_success':
        return '登录成功，正在获取 Cookie...';
      case 'success':
        return 'Cookie 获取成功！';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cookie className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold">Cookie 账号管理</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-all"
        >
          <UserPlus className="w-5 h-5" />
          添加账号
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <Cookie className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">暂无账号，请添加抖音 Cookie</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg transition-all"
          >
            添加第一个账号
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all animate-fadeIn"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${account.expired === 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse-glow`} />
                  <div>
                    <h3 className="font-semibold text-lg">{account.id}</h3>
                    <p className="text-sm text-gray-400">
                      创建时间: {formatDate(account.ct)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    account.expired === 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {account.expired === 0 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        有效
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        过期
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => copyCookie(account.cookie, account.id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copiedId === account.id ? '已复制!' : '复制 Cookie'}
                </button>
                <button
                  onClick={() => markAccountExpired(account.id)}
                  className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-3 py-1.5 rounded-lg text-sm transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  标记过期
                </button>
                <button
                  onClick={() => removeAccount(account.id)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加账号弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary-500" />
              添加新账号
            </h3>
            
            {/* 自动获取按钮 */}
            <div className="bg-gradient-to-r from-primary-500/20 to-pink-500/20 border border-primary-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-primary-500" />
                  <div>
                    <h4 className="font-semibold text-primary-400">自动获取 Cookie（推荐）</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      点击按钮，自动打开浏览器登录抖音
                    </p>
                  </div>
                </div>
                {fetchingCookie ? (
                  <button
                    onClick={cancelFetch}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    取消
                  </button>
                ) : (
                  <button
                    onClick={startAutoFetch}
                    className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    <Monitor className="w-4 h-4" />
                    打开浏览器登录
                  </button>
                )}
              </div>
              
              {fetchingCookie && (
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-gray-300">{getFetchStatusMessage()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {fetchStatus === 'waiting' && '请在弹出的浏览器窗口中扫码或账号密码登录'}
                  </p>
                  {fetchStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-400 mt-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Cookie 已自动填充到下方表单！</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 分割线 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-gray-500 text-sm">或手动填写</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">账号名称</label>
                <input
                  type="text"
                  value={newAccount.id}
                  onChange={(e) => setNewAccount({...newAccount, id: e.target.value})}
                  placeholder="例如: my_account"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Cookie</label>
                <textarea
                  value={newAccount.cookie}
                  onChange={(e) => setNewAccount({...newAccount, cookie: e.target.value})}
                  placeholder="粘贴抖音 Cookie 内容..."
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-400 mb-2">手动获取 Cookie 方法：</h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>打开抖音网页版并登录</li>
                <li>按 F12 打开开发者工具</li>
                <li>点击 Network 标签</li>
                <li>进入任意视频详情页</li>
                <li>找到 <code className="bg-gray-700 px-1 rounded">aweme/detail</code> 请求</li>
                <li>复制 Request Headers 中的 Cookie</li>
              </ol>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addAccount}
                className="flex-1 bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                添加账号
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFetchingCookie(false);
                  setFetchStatus('');
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieManager;
