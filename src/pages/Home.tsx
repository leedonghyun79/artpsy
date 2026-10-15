import { useEffect } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import DrawingTest from './DrawingTest';

/**
 * 메인 페이지 = 그림 심리 테스트
 * - 진입하자마자 주제 선택 화면이 바로 보이도록 DrawingTest를 바로 렌더링
 */
export default function Home() {
  useEffect(() => {
    document.title = '그림심리테스트';

    // 뒤로가기 시 앱 종료를 위한 히스토리 트랩
    const setupExitTrap = () => {
      if (!window.history.state?.exitTrap) {
        window.history.pushState({ exitTrap: true }, '');
      }
    };

    setupExitTrap();

    const handlePopState = () => {
      // '#' 또는 '#/' (홈) 상태에서 뒤로가기가 시도되면 앱 종료
      const isHome = !window.location.hash || window.location.hash === '#/';
      if (isHome) {
        closeView().catch(() => {
          // 브릿지 호출 실패 시 (일반 브라우저) 다시 트랩 설치
          setupExitTrap();
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <DrawingTest />;
}
