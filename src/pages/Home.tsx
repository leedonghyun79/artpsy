import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { userName } = useApp();
  const { userInfo } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-20">
      {/* Top Bar - Logo & Title */}
      <div className="px-5 py-3 flex items-center bg-transparent">
        <div className="flex items-center gap-2">
          <img
            src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
            alt="Logo"
            className="w-6 h-6 object-contain"
          />
          <span className="text-[17px] font-bold text-[#191F28] tracking-tight">그림심리테스트</span>
        </div>
      </div>

      <main className="px-5 pt-6 animate-enter">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#191F28] leading-tight mb-1.5">
            오늘 {userInfo?.name || userName}님의 마음은<br />
            어떤가요?
          </h1>
          <p className="text-[16px] font-semibold text-[#3182F6]">
            그림 분석을 통해 알아보세요.
          </p>
        </div>

        {/* Hero Card: Drawing Test (Full Width) */}
        <div
          onClick={() => navigate('/test')}
          className="surface p-7 mb-10 relative overflow-hidden group transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="relative z-10">
            <img
              src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
              alt="Artpsy Logo"
              className="w-[52px] h-[52px] object-contain mb-4 animate-pop delay-100 origin-bottom-left"
            />
            <h3 className="t-h2 text-[#191F28] mb-2">그림 심리 테스트</h3>
            <p className="t-body2 text-[#6B7684] mb-8">30초 만에 그리는<br />나의 무의식 세계</p>

            <button className="btn-toss pointer-events-none animate-pulse">
              시작하기
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        </div>

        {/* Ability Tests (2x2 Grid) */}
        <h3 className="text-[17px] font-bold text-[#333D4B] ml-1 mb-4 mt-10">나의 능력치 진단</h3>

        <div className="grid grid-cols-2 gap-3 pb-8">
          {/* Group 1: Speed & Timing */}
          <div
            onClick={() => navigate('/reaction')}
            className="surface p-5 flex flex-col justify-between h-[150px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-[17px] font-bold text-[#191F28] mb-1">순발력 테스트</h3>
              <p className="text-[13px] text-[#8B95A1] leading-snug">0.1초의 승부<br />신의 손 도전</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/timing')}
            className="surface p-5 flex flex-col justify-between h-[150px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">⏰</div>
            <div>
              <h3 className="text-[17px] font-bold text-[#191F28] mb-1">시간 테스트</h3>
              <p className="text-[13px] text-[#8B95A1] leading-snug">정확히 1.00초<br />칼타이밍 도전</p>
            </div>
          </div>

          {/* Group 2: Memory & Vision */}
          <div
            onClick={() => navigate('/memory')}
            className="surface p-5 flex flex-col justify-between h-[150px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">🧠</div>
            <div>
              <h3 className="text-[17px] font-bold text-[#191F28] mb-1">기억력 테스트</h3>
              <p className="text-[13px] text-[#8B95A1] leading-snug">가려진 숫자를<br />기억하세요</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/color')}
            className="surface p-5 flex flex-col justify-between h-[150px] active:scale-[0.96] transition-transform cursor-pointer border border-[#F2F4F6]"
          >
            <div className="text-3xl">👀</div>
            <div>
              <h3 className="text-[17px] font-bold text-[#191F28] mb-1">색감 테스트</h3>
              <p className="text-[13px] text-[#8B95A1] leading-snug">미세한 차이를<br />찾아내기</p>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
