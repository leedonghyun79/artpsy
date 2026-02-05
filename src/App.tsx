import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Settings from './pages/Settings';
import DrawingTest from './pages/DrawingTest';
import ReactionTest from './pages/ReactionTest';
import MemoryTest from './pages/MemoryTest';
import ColorTest from './pages/ColorTest';
import TimingTest from './pages/TimingTest';

/**
 * 앱 라우팅 컴포넌트
 * - 온보딩 완료 여부에 따라 다른 라우트 표시
 */
function AppRoutes() {
  const { isOnboardingComplete } = useApp();

  // 온보딩이 완료되지 않았으면 온보딩 페이지만 표시
  if (!isOnboardingComplete) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  // 온보딩 완료 후 전체 앱 라우트 표시
  return (
    <Routes>
      <Route path="/test" element={<DrawingTest />} />
      <Route path="/reaction" element={<ReactionTest />} />
      <Route path="/memory" element={<MemoryTest />} />
      <Route path="/color" element={<ColorTest />} />
      <Route path="/timing" element={<TimingTest />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

/**
 * 메인 앱 컴포넌트
 * - MemoryRouter를 사용하여 SPA 라우팅 구현
 * - URL 해시를 파싱하여 딥링크 지원
 */
export default function App() {
  // URL 경로 파싱 (딥링크 지원)
  const path = window.location.hash.replace('#', '') || '/';

  return (
    <AppProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </AppProvider>
  );
}
