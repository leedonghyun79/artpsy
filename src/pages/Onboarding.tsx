import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { useApp } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

type Phase = 'intro' | 'loading';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    height: '100vh',
    padding: '16px',
    overflow: 'hidden',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '4px 0',
    marginBottom: '2px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.grey900,
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    fontWeight: 400,
    color: colors.grey700,
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.3,
  },
  stepContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '4px 0',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    border: `1px solid ${colors.grey100}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  stepIconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue50,
    borderRadius: '50%',
    marginRight: '12px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.grey900,
    margin: '0 0 2px 0',
    letterSpacing: '-0.2px',
  },
  stepDesc: {
    fontSize: '13px',
    fontWeight: 400,
    color: colors.grey600,
    margin: 0,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '12px',
    padding: '0',
    paddingBottom: '8px',
  },
  spacer40: { height: '8px' },
  spacer12: { height: '4px' },
  spacer48: { height: '8px' },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const { login, userInfo, loading: authLoading } = useAuthContext();
  const [phase, setPhase] = useState<Phase>('intro');

  useEffect(() => {
    document.title = '그림심리테스트';
  }, []);

  useEffect(() => {
    if (userInfo) {
      completeOnboarding(userInfo.name || '사용자');
      navigate('/', { replace: true });
    }
  }, [userInfo, completeOnboarding, navigate]);

  const handleStart = async () => {
    setPhase('loading');
    try {
      await login();
    } catch (e: any) {
      console.error('Login Error:', e);
      setPhase('intro');
    }
  };

  if (phase === 'loading') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🎨
          </div>
          <div className="text-stone-600 font-bold text-lg">마음을 읽는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, backgroundColor: colors.grey50 }}>
      <div style={styles.spacer40} />
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎨</div>

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
            className={`w-full py-4 rounded-xl bg-[#3182F6] text-white font-bold text-lg transition-opacity ${authLoading ? 'opacity-70' : 'active:opacity-80'}`}
            onClick={handleStart}
            disabled={authLoading}
          >
            {authLoading ? '연결 중...' : '시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
