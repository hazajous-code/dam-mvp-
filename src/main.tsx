import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import './index.css'

// 참고: recharts ResponsiveContainer가 React 18 StrictMode의 dev 이중 마운트에서
// ResizeObserver 구독이 해제돼 차트가 렌더되지 않는 이슈가 있어 StrictMode는 미사용합니다.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </HashRouter>,
)
