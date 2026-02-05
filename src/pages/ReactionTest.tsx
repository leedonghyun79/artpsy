import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdMob } from '../hooks/useAdMob';

type TestState = 'idle' | 'waiting' | 'ready' | 'too-soon' | 'finished';

export default function ReactionTest() {
  const navigate = useNavigate();
  const { showInterstitial } = useAdMob();
  const [state, setState] = useState<TestState>('idle');
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  const timerRef = useRef<number | null>(null);


  useEffect(() => {
    const today = new Date().toDateString();
    const countKey = `reaction_play_count_${today}`;
    setPlayCount(parseInt(localStorage.getItem(countKey) || '0'));
  }, []);

  const startTest = async () => {
    // 3회 이상 플레이 시 전면 광고 로직
    const today = new Date().toDateString();
    const countKey = `reaction_play_count_${today}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0');

    if (currentCount >= 3) {
      console.log('ReactionTest: 3회 이상 플레이 감지. 광고를 송출합니다.');
      try {
        await showInterstitial();
        // 광고를 봤으므로 카운트 초기화
        localStorage.setItem(countKey, '0');
        setPlayCount(0);
      } catch (e) {
        console.error('Ad failed:', e);
      }
    } else {
      // 3회 미만일 때만 카운트 증가
      const newCount = currentCount + 1;
      localStorage.setItem(countKey, newCount.toString());
      setPlayCount(newCount);
    }

    setState('waiting');
    const randomTime = Math.floor(Math.random() * 3000) + 2000; // 2~5초 랜덤

    timerRef.current = window.setTimeout(() => {
      setState('ready');
      setStartTime(performance.now());
    }, randomTime);
  };

  const handleClick = () => {
    if (state === 'idle') {
      startTest();
    } else if (state === 'waiting') {
      // 너무 빨리 누름
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('too-soon');
    } else if (state === 'ready') {
      // 성공
      const endTime = performance.now();
      setResult(Math.round(endTime - startTime));
      setState('finished');
    } else if (state === 'too-soon' || state === 'finished') {
      // 다시 시작
      setState('waiting');
      const randomTime = Math.floor(Math.random() * 3000) + 2000;
      timerRef.current = window.setTimeout(() => {
        setState('ready');
        setStartTime(performance.now());
      }, randomTime);
    }
  };

  const getRank = (ms: number) => {
    if (ms < 200) return { text: "상위 1% 신의 손 ⚡", desc: "프로게이머 수준이에요!" };
    if (ms < 250) return { text: "상위 10% 빛의 속도", desc: "엄청난 반사신경이네요." };
    if (ms < 300) return { text: "평균 이상의 순발력", desc: "운동신경이 좋으시군요." };
    if (ms < 400) return { text: "평범한 일반인", desc: "나쁘지 않은 속도예요." };
    return { text: "조금 느긋한 편 🐢", desc: "안전운전 하실 것 같아요." };
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'idle': return 'bg-[#3182F6]'; // Toss Blue
      case 'waiting': return 'bg-[#FF3B30]'; // Red
      case 'ready': return 'bg-[#34C759]'; // Green
      case 'too-soon': return 'bg-[#FF9500]'; // Orange
      case 'finished': return 'bg-[#3182F6]'; // Blue
      default: return 'bg-[#3182F6]';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`min-h-screen ${getBackgroundColor()} transition-colors duration-200 cursor-pointer select-none touch-manipulation flex flex-col`}
    >
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-1 fixed top-0 w-full z-10">
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/'); }}
          className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-[18px] font-bold text-white tracking-tight">순발력 테스트</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white animate-enter">
        {state === 'idle' && (
          <>
            <div className="text-6xl mb-6 animate-pop">⚡</div>
            <h1 className="text-3xl font-bold mb-4">순발력 테스트</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              화면 배경색이 초록색으로 바뀌면<br />
              최대한 빨리 화면을 터치하세요!
            </p>
            <div className="w-[220px] mt-12 h-[56px] bg-white/20 rounded-[18px] flex items-center justify-center font-bold text-lg animate-pulse pointer-events-none px-4">
              {playCount >= 3 ? '광고 보고 계속하기' : '테스트 시작하기'}
            </div>
          </>
        )}

        {state === 'waiting' && (
          <>
            <div className="text-6xl mb-6">✋</div>
            <h2 className="text-3xl font-bold mb-2">기다리세요...</h2>
            <p className="text-xl opacity-90">아직 누르지 마세요</p>
          </>
        )}

        {state === 'ready' && (
          <>
            <div className="text-7xl mb-6 animate-pop">👆</div>
            <h2 className="text-4xl font-bold mb-2">지금 누르세요!</h2>
            <p className="text-xl opacity-90">Click! Click!</p>
          </>
        )}

        {state === 'too-soon' && (
          <div className="animate-pop">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold mb-2">너무 빨랐어요!</h2>
            <p className="text-xl opacity-90 mb-12">초록색이 된 후에 눌러주세요</p>

            <div className="flex gap-3 w-full max-w-[280px] mx-auto">
              <button
                onClick={(e) => { e.stopPropagation(); startTest(); }}
                className="flex-1 h-[56px] rounded-[18px] bg-white text-[#FF9500] font-bold text-lg active:scale-95 transition-transform shadow-lg"
              >
                다시 도전
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/'); }}
                className="flex-1 h-[56px] rounded-[18px] bg-black/20 text-white font-bold text-lg active:scale-95 transition-transform"
              >
                홈으로
              </button>
            </div>
          </div>
        )}

        {state === 'finished' && (
          <div className="animate-pop w-full">
            <h1 className="text-2xl font-bold text-white mb-2">게임 종료!</h1>
            <div className="text-6xl mb-4">⏱️</div>
            <div className="text-8xl font-black mb-2 tracking-tighter">
              {result}<span className="text-4xl font-bold ml-1">ms</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 opacity-90">{getRank(result).text}</h2>
            <p className="text-lg opacity-80 mb-12">{getRank(result).desc}</p>

            <div className="flex gap-3 w-full max-w-[280px] mx-auto">
              <button
                onClick={(e) => { e.stopPropagation(); startTest(); }}
                className="flex-1 h-[56px] rounded-[18px] bg-white text-[#3182F6] font-bold text-lg active:scale-95 transition-transform shadow-lg"
              >
                다시 도전
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/'); }}
                className="flex-1 h-[56px] rounded-[18px] bg-black/20 text-white font-bold text-lg active:scale-95 transition-transform"
              >
                홈으로
              </button>
            </div>
          </div>
        )}

        {(state === 'waiting' || state === 'ready') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (timerRef.current) clearTimeout(timerRef.current);
              setState('finished');
            }}
            className="mt-12 w-[120px] py-3 rounded-[16px] bg-white/20 text-white font-bold text-sm active:scale-95 transition-transform"
          >
            그만하기
          </button>
        )}
      </div>
    </div>
  );
}
