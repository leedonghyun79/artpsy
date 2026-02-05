import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, AgreementV4 } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { useApp } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

type Phase = 'intro' | 'loading' | 'login';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '40px',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '10px 0',
    marginBottom: '0',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: colors.grey900,
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 400,
    color: colors.grey700,
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.4,
  },
  stepContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '0 4px',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '8px 0',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: colors.white,
    borderRadius: '20px',
    border: `1px solid ${colors.grey100}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  stepIconWrapper: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue50,
    borderRadius: '50%',
    marginRight: '16px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.grey900,
    margin: '0 0 4px 0',
    letterSpacing: '-0.2px',
  },
  stepDesc: {
    fontSize: '14.5px',
    fontWeight: 400,
    color: colors.grey600,
    margin: 0,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '16px',
    padding: '0 4px',
  },
  spacer40: { height: '20px' },
  spacer12: { height: '8px' },
  spacer48: { height: '16px' },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const { login, userInfo, loading: authLoading, error: authError } = useAuthContext();
  const [phase, setPhase] = useState<Phase>('intro');
  const [agreed1, setAgreed1] = useState(true);
  const [agreed2, setAgreed2] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 토스 로그인 성공 시 온보딩 완료 처리
  useEffect(() => {
    if (userInfo) {
      console.log('Onboarding: userInfo detected, navigating to home...', userInfo);
      completeOnboarding(userInfo.name || '사용자');
      navigate('/', { replace: true });
    }
  }, [userInfo, completeOnboarding, navigate]);

  const proceedToLogin = () => {
    setTimeout(() => {
      setPhase('login');
    }, 1500);
  };

  const handleLogin = async () => {
    console.log("Onboarding: handleLogin triggered, authLoading:", authLoading);
    if (authLoading) return;
    await login();
    console.log("Onboarding: login() function call finished");
  };

  if (phase === 'loading') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
            alt="로고"
            className="w-20 h-20 object-contain mx-auto mb-6 animate-bounce"
          />
          <div className="text-stone-600 font-bold">마음을 읽는 중...</div>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div style={{ ...styles.container, backgroundColor: colors.grey50 }}>
        <div style={styles.spacer40} />
        <img
          src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
          alt="로고"
          style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '16px' }}
        />

        <div style={styles.heroSection}>
          <h1 style={styles.title}>
            그림으로 들여다보는<br />
            나의 <span style={{ color: '#3182F6' }}>진짜 속마음</span>
          </h1>
          <div style={styles.spacer12} />
          <p style={styles.subtitle}>
            3가지 특징으로 만나는 AI 심리 분석
          </p>
        </div>

        <div style={styles.spacer48} />

        <div style={styles.stepContainer}>
          <div style={styles.stepList}>
            {[
              { number: '1', text: '무의식 속 내면 분석', iconSrc: 'u1F3A8.png', desc: '그림을 통해 말로 전하기 힘든 속마음을 만나요' },
              { number: '2', text: '나의 능력치 진단', iconSrc: 'u26A1.png', desc: '순발력, 기억력, 색감 등 숨겨진 능력을 측정해요' },
              { number: '3', text: '나만의 심리 리포트', iconSrc: 'u1F4D1.png', desc: 'AI가 제안하는 나를 위한 맞춤 조언을 받아보세요' }
            ].map((s) => (
              <div key={s.number} style={styles.stepCard}>
                <div style={styles.stepIconWrapper}>
                  <Asset.Image
                    frameShape={Asset.frameShape.CleanW24}
                    backgroundColor="transparent"
                    src={`https://static.toss.im/2d-emojis/png/4x/${s.iconSrc}`}
                    aria-hidden={true}
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
                <div style={styles.stepContent}>
                  <p style={styles.stepText}>{s.text}</p>
                  <p style={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.buttonContainer}>
            <button
              className="w-full py-4 rounded-xl bg-[#3182F6] text-white font-bold text-lg hover:opacity-90 transition-opacity"
              onClick={() => {
                setPhase('loading');
                proceedToLogin();
              }}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: Login (Image-inspired UI)
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300 w-max">
          <div className="bg-[#2B2C2F]/95 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl border border-white/5 mx-auto">
            <div className="w-[18px] h-[18px] bg-[#FFB300] rounded-full flex items-center justify-center text-[12px] font-black text-[#191F28] pb-[1px] flex-shrink-0">!</div>
            <span className="text-white text-[14.5px] font-medium tracking-tight whitespace-nowrap">꼭 동의해야 하는 항목이에요.</span>
          </div>
        </div>
      )}

      <div className="pt-4 flex items-center gap-1 mb-8">
        <button onClick={() => setPhase('intro')} className="p-2 -ml-2" disabled={authLoading}>
          <svg className="w-6 h-6 text-[#191F28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png"
            alt="Logo"
            className="w-6 h-6 object-contain"
          />
          <span className="text-[18px] font-bold text-[#191F28] tracking-tight">그림심리테스트</span>
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-[26px] font-bold text-[#191F28] mb-10 leading-tight">
          그림심리테스트에<br />
          토스로 가입할게요
        </h1>

        <div className="space-y-0.5 mb-10 px-1">
          <AgreementV4
            variant="small"
            onClick={() => {
              if (agreed2) triggerToast();
              else setAgreed2(true);
            }}
            left={
              <svg
                className="w-5 h-5 mt-0.5"
                fill="none"
                stroke={agreed2 ? "#3182F6" : "#D1D6DB"}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
              </svg>
            }
            middle={
              <AgreementV4.Text>
                <span style={{ color: '#3182F6' }} className="font-bold mr-1">필수</span>
                <span className="text-[#4E5968]">개인정보 제 3자 제공 동의</span>
              </AgreementV4.Text>
            }
          />
          <AgreementV4
            variant="small"
            onClick={() => {
              if (agreed1) triggerToast();
              else setAgreed1(true);
            }}
            left={
              <svg
                className="w-5 h-5 mt-0.5"
                fill="none"
                stroke={agreed1 ? "#3182F6" : "#D1D6DB"}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
              </svg>
            }
            middle={
              <AgreementV4.Text>
                <span style={{ color: '#3182F6' }} className="font-bold mr-1">필수</span>
                <span className="text-[#4E5968]">서비스 이용약관(제휴사)</span>
              </AgreementV4.Text>
            }
          />
        </div>

        {authError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            ⚠️ {authError}
          </div>
        )}
      </div>

      <div className="pb-8 space-y-4">
        <button
          onClick={handleLogin}
          disabled={authLoading || !agreed1 || !agreed2}
          className={`w-full py-4 rounded-2xl bg-[#3182F6] text-white font-bold text-[17px] transition-all active:scale-[0.98] ${(authLoading || !agreed1 || !agreed2) ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
            }`}
        >
          {authLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>연결 중...</span>
            </div>
          ) : (
            '동의하고 가입하기'
          )}
        </button>
        <button
          onClick={() => setPhase('intro')}
          disabled={authLoading}
          className="w-full py-3 text-[#6B7684] font-semibold text-[15px] hover:text-[#4E5968] disabled:opacity-50"
        >
          닫기
        </button>
      </div>
    </div >
  );
}
