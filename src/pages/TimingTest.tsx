import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdMob } from '../hooks/useAdMob';

export default function TimingTest() {
  const navigate = useNavigate();
  const { showInterstitial } = useAdMob();
  const [state, setState] = useState<'idle' | 'ready' | 'holding' | 'result'>('idle');
  const [result, setResult] = useState(0);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const [scale, setScale] = useState(1);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    document.title = '시간 테스트';
    const today = new Date().toDateString();
    const countKey = `timing_play_count_${today}`;
    setPlayCount(parseInt(localStorage.getItem(countKey) || '0'));
  }, []);

  const onStartClick = async () => {
    if (state !== 'idle') return;
    const today = new Date().toDateString();
    const countKey = `timing_play_count_${today}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0');

    if (currentCount >= 3) {
      try {
        await showInterstitial();
        localStorage.setItem(countKey, '0');
        setPlayCount(0);
      } catch (e) {
        console.error('Ad failed:', e);
      }
    } else {
      const newCount = currentCount + 1;
      localStorage.setItem(countKey, newCount.toString());
      setPlayCount(newCount);
    }
    setState('ready');
  };

  const startHolding = () => {
    if (state !== 'ready') return;
    setState('holding');
    startTimeRef.current = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      setScale(1 + Math.sin(elapsed / 200) * 0.05);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopHolding = () => {
    if (state !== 'holding') return;
    cancelAnimationFrame(animationFrameRef.current);
    const endTime = performance.now();
    const duration = (endTime - startTimeRef.current) / 1000;
    setResult(duration);
    setState('result');
    setScale(1);
  };

  const reset = () => {
    setState('idle');
    setResult(0);
  };

  const getRank = (time: number) => {
    const diff = Math.abs(time - 1.0);
    if (diff < 0.01) return { rank: "👑 시간의 지배자", msg: "완벽해요! 소름돋네요." };
    if (diff < 0.05) return { rank: "🕰️ 인간 시계", msg: "거의 완벽해요!" };
    if (diff < 0.1) return { rank: "⏱️ 칼같은 타이밍", msg: "상당한 감각이네요." };
    if (diff < 0.3) return { rank: "🙂 일반인", msg: "나쁘지 않아요." };
    return { rank: "🐢 느긋한 성격", msg: "조금 더 집중해보세요!" };
  };

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      className="min-h-screen bg-[#F2F4F6] flex flex-col select-none"
      onContextMenu={handleContextMenu}
    >
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-enter pt-10">
        {state === 'idle' && (
          <div className="animate-pop">
            <div className="text-6xl mb-6">⏱️</div>
            <h1 className="text-3xl font-bold text-[#191F28] mb-3">정확히 1.00초</h1>
            <p className="text-[#6B7684] mb-12 leading-relaxed">
              버튼을 꾹 누르다가<br />
              <span className="text-[#3182F6] font-bold">정확히 1초</span>가 되면 떼세요!
            </p>

            <button
              onClick={onStartClick}
              className="btn-toss w-[220px] mx-auto text-lg shadow-lg shadow-blue-500/30 animate-pulse px-4"
            >
              {playCount >= 3 ? '광고 보고 계속하기' : '테스트 시작하기'}
            </button>
          </div>
        )}

        {(state === 'ready' || state === 'holding') && (
          <div className="animate-pop">
            <div className="text-6xl mb-6">{state === 'ready' ? '🎯' : '🤫'}</div>
            <h1 className="text-3xl font-bold text-[#191F28] mb-3">
              {state === 'ready' ? '준비하세요!' : '집중하세요...'}
            </h1>
            <p className="text-[#6B7684] mb-12">
              {state === 'ready' ? '아래 버튼을 1초 동안 꾹 누르세요' : '1초라고 생각될 때 손을 떼세요'}
            </p>

            <button
              onMouseDown={startHolding}
              onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }}
              className={`w-48 h-48 rounded-full text-white text-xl font-bold shadow-lg transition-all active:scale-95 touch-manipulation flex items-center justify-center ${state === 'ready'
                ? 'bg-[#3182F6] shadow-blue-500/30 animate-pulse'
                : 'bg-[#FF3B30] shadow-red-500/30'
                }`}
              style={{ transform: state === 'holding' ? `scale(${scale})` : undefined }}
            >
              {state === 'ready' ? '누르기 시작!' : '손 떼기!'}
            </button>

            {state === 'holding' && (
              <button
                onClick={() => {
                  cancelAnimationFrame(animationFrameRef.current);
                  setState('result');
                }}
                className="mt-12 w-[120px] py-3 rounded-[16px] bg-[#E5E8EB] text-[#6B7684] font-bold text-sm active:scale-95 transition-transform"
              >
                그만하기
              </button>
            )}
          </div>
        )}

        {state === 'result' && (
          <div className="animate-pop w-full max-w-sm">
            <h1 className="text-2xl font-bold text-[#191F28] mb-6 text-center">게임 종료!</h1>
            <div className="text-7xl mb-4 font-black text-[#191F28] tracking-tighter">
              {result.toFixed(2)}<span className="text-3xl font-medium text-[#8B95A1] ml-1">초</span>
            </div>

            <div className={`text-2xl font-bold mb-2 ${Math.abs(result - 1.0) < 0.05 ? 'text-[#3182F6]' : 'text-[#333D4B]'}`}>
              {getRank(result).rank}
            </div>
            <p className="text-[#6B7684] mb-10">{getRank(result).msg}</p>

            <div className="flex gap-3 w-full max-w-[280px] mx-auto">
              <button onClick={reset} className="flex-1 h-[56px] rounded-[18px] bg-[#3182F6] text-white font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-blue-500/20">
                다시 도전
              </button>
              <button onClick={() => navigate(-1)} className="flex-1 h-[56px] rounded-[18px] bg-[#E5E8EB] text-[#6B7684] font-bold text-lg active:scale-95 transition-transform">
                홈으로
              </button>
            </div>

            {Math.abs(result - 1.0) < 0.01 && (
              <div className="mt-8 p-4 bg-yellow-50 rounded-xl text-yellow-700 animate-pulse">
                🎉 와우! 0.01초 오차 이내 성공! 🎉
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
