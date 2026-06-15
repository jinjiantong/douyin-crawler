import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import PlatformSelect from './pages/PlatformSelect'
import DouyinModule from './pages/douyin/DouyinModule'
import { XHSPlaceholder, BilibiliPlaceholder, KuaishouPlaceholder, WeiboPlaceholder, TiebaPlaceholder, ZhihuPlaceholder } from './pages/platforms/PlatformPlaceholder'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlatformSelect />} />
        <Route path="/douyin/*" element={<DouyinModule />} />
        <Route path="/xhs" element={<XHSPlaceholder />} />
        <Route path="/bilibili" element={<BilibiliPlaceholder />} />
        <Route path="/kuaishou" element={<KuaishouPlaceholder />} />
        <Route path="/weibo" element={<WeiboPlaceholder />} />
        <Route path="/tieba" element={<TiebaPlaceholder />} />
        <Route path="/zhihu" element={<ZhihuPlaceholder />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)