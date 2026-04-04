import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { closeView } from '@apps-in-toss/web-framework';

export default function Home() {
  const navigate = useNavigate();

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

  return (
    <div className="h-screen overflow-hidden bg-[#F2F4F6] flex flex-col">
      <main className="flex-1 px-5 pt-8 pb-6 animate-enter flex flex-col">

        {/* Hero Card: Drawing Test (Main Action) */}
        <div
          onClick={() => navigate('/test')}
          className="surface p-5 mb-5 relative overflow-hidden group transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-start mb-3">
                <img
                  src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
                  alt="Artpsy Logo"
                  className="w-10 h-10 object-contain animate-pop delay-100"
                />
              </div>
              <h3 className="text-[22px] font-bold text-[#191F28] mb-0.5">그림 심리 테스트</h3>
              <p className="text-[17px] text-[#6B7684] mb-4 leading-snug">나의 무의식 세계 분석하기</p>

              <div className="inline-flex mt-6 items-center gap-1.5 px-3 py-1.5 bg-[#3182F6] text-white rounded-full text-[18px] font-bold shadow-sm">
                시작하기
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 border border-blue-50"></div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 mt-[26px] mb-[15px] px-1">
          <h3 className="text-[19px] font-bold text-[#333D4B]">나의 능력치 진단</h3>
        </div>

        {/* Ability Tests Grid (Tightened Grid) */}
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-[25px] pb-6">
          <div
            onClick={() => navigate('/reaction')}
            className="surface p-4 flex flex-col justify-center items-start gap-5 h-[145px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-[19px] font-bold text-[#191F28] mb-0.5">순발력 테스트</h3>
              <p className="text-[14px] text-[#8B95A1] leading-tight">0.1초의 승부</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/timing')}
            className="surface p-4 flex flex-col justify-center items-start gap-5 h-[145px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">⏰</div>
            <div>
              <h3 className="text-[19px] font-bold text-[#191F28] mb-0.5">시간 테스트</h3>
              <p className="text-[14px] text-[#8B95A1] leading-tight">정확히 1.00초</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/memory')}
            className="surface p-4 flex flex-col justify-center items-start gap-5 h-[145px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">🧠</div>
            <div>
              <h3 className="text-[19px] font-bold text-[#191F28] mb-0.5">기억력 테스트</h3>
              <p className="text-[14px] text-[#8B95A1] leading-tight">가려진 숫자 기억</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/color')}
            className="surface p-4 flex flex-col justify-center items-start gap-5 h-[145px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">👀</div>
            <div>
              <h3 className="text-[19px] font-bold text-[#191F28] mb-0.5">색감 테스트</h3>
              <p className="text-[14px] text-[#8B95A1] leading-tight">미세한 차이 찾기</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
