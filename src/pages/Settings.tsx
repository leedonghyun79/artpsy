import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { resetApp } = useApp();
  const { userInfo, logout } = useAuthContext();

  const handleReset = async () => {
    if (confirm('정말로 로그아웃하고 앱을 초기화하시겠습니까?')) {
      await logout();
      resetApp();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 p-2 text-[#333D4B]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-1 text-[#191F28]">설정</h1>
      </header>

      <main className="p-5 space-y-6">
        {/* Section 1: App Info */}
        <section>
          <h2 className="text-sm font-semibold text-[#8B95A1] mb-2 px-1">앱 정보</h2>
          <div className="bg-white rounded-[20px] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#F2F4F6]">
              <span className="text-[#333D4B]">버전</span>
              <span className="text-[#8B95A1]">1.0.0</span>
            </div>
            <div className="flex justify-between items-center p-5">
              <span className="text-[#333D4B]">빌드</span>
              <span className="text-[#8B95A1]">Production</span>
            </div>
          </div>
        </section>

        {/* Section 2: Account */}
        <section>
          <h2 className="text-sm font-semibold text-[#8B95A1] mb-2 px-1">계정</h2>
          <div className="bg-white rounded-[20px] overflow-hidden">
            <div className="p-5 border-b border-[#F2F4F6]">
              <span className="text-[#333D4B] block mb-1">내 정보</span>
              <pre className="text-xs text-[#8B95A1] bg-[#F9FAFB] p-3 rounded-lg overflow-x-auto">
                {userInfo ? JSON.stringify(userInfo, null, 2) : '로그인 정보 없음'}
              </pre>
            </div>
            <button onClick={() => alert('준비 중')} className="w-full flex justify-between items-center p-5 border-b border-[#F2F4F6] active:bg-[#F9FAFB]">
              <span className="text-[#333D4B]">프로필 수정</span>
              <svg className="w-5 h-5 text-[#D1D6DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Section 3: Danger Zone */}
        <section>
          <div className="bg-white rounded-[20px] overflow-hidden">
            <button
              onClick={handleReset}
              className="w-full p-5 text-left text-[#FF3B30] font-medium active:bg-[#F9FAFB] flex items-center justify-center"
            >
              앱 초기화
            </button>
          </div>
          <p className="text-xs text-[#8B95A1] text-center mt-3">
            초기화 시 모든 데이터가 삭제됩니다.
          </p>
        </section>

        <div className="text-center py-8">
          <span className="text-xs text-[#B0B8C1]">Designed by Toss Style</span>
        </div>
      </main>
    </div>
  );
}
