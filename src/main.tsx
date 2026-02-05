import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@toss/tds-mobile';

// 앱 시작 시 초기 history state 추가 (앱인토스 웹뷰 환경 대응)
window.history.pushState({ page: 'init' }, '', '');

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
)
