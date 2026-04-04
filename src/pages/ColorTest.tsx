import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdMob } from '../hooks/useAdMob';

export default function ColorTest() {
  const navigate = useNavigate();
  const { showInterstitial } = useAdMob();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gridSize, setGridSize] = useState(2);
  const [baseColor, setBaseColor] = useState({ r: 0, g: 0, b: 0 });
  const [answerIdx, setAnswerIdx] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);

  useEffect(() => {
    document.title = '색감 테스트';
    const today = new Date().toDateString();
    const countKey = `color_play_count_${today}`;
    setPlayCount(parseInt(localStorage.getItem(countKey) || '0'));
  }, []);

  const getDiff = (lvl: number) => Math.max(10, 80 - Math.floor(lvl * 1.5));

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timer);
            setIsPlaying(false);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPlaying, timeLeft]);

  const startGame = async () => {
    const today = new Date().toDateString();
    const countKey = `color_play_count_${today}`;
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

    setScore(0);
    setLevel(1);
    setGridSize(2);
    setTimeLeft(15);
    setIsPlaying(true);
    generateLevel(1);
  };

  const generateLevel = (lvl: number) => {
    const size = Math.min(8, Math.floor((lvl + 1) / 2) + 2);
    setGridSize(size);
    const r = Math.floor(Math.random() * 200) + 25;
    const g = Math.floor(Math.random() * 200) + 25;
    const b = Math.floor(Math.random() * 200) + 25;
    setBaseColor({ r, g, b });
    setAnswerIdx(Math.floor(Math.random() * (size * size)));
  };

  const handleClick = (index: number) => {
    if (!isPlaying) return;

    if (index === answerIdx) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setScore(prev => prev + 100 * Math.floor(nextLevel / 2));
      setTimeLeft(prev => Math.min(15, prev + 1.5));
      generateLevel(nextLevel);
    } else {
      setShowPenalty(true);
      setTimeout(() => setShowPenalty(false), 500);
      const newTime = Math.max(0, timeLeft - 3.0);
      setTimeLeft(newTime);
      if (newTime <= 0) {
        setIsPlaying(false);
      }
    }
  };

  const getTileStyle = (index: number) => {
    const isAnswer = index === answerIdx;
    const diff = getDiff(level);
    const r = isAnswer ? Math.min(255, baseColor.r + diff) : baseColor.r;
    const g = isAnswer ? Math.min(255, baseColor.g + diff) : baseColor.g;
    const b = isAnswer ? Math.min(255, baseColor.b + diff) : baseColor.b;
    return {
      backgroundColor: `rgb(${r}, ${g}, ${b})`,
    };
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col">
      {/* UI Hud for Active Game */}
      {isPlaying && (
        <div className="fixed top-4 left-0 right-0 px-6 flex justify-between items-center z-20 pointer-events-none">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E5E8EB] font-bold text-[#191F28]">
            Lv. {level}
          </div>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E5E8EB] font-bold text-[#3182F6]">
            {score.toLocaleString()}점
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 animate-enter w-full mx-auto pt-10">
        {!isPlaying && timeLeft === 15 ? (
          <div className="text-center">
            <div className="text-7xl mb-6 animate-pop">👀</div>
            <h1 className="text-2xl font-bold text-[#191F28] mb-3">색감 테스트</h1>
            <p className="text-[#6B7684] mb-8 leading-relaxed">
              다른 색깔의 사각형을 찾아보세요.<br />
              레벨이 올라갈수록 더 비슷해집니다.
            </p>
            <button onClick={startGame} className="btn-toss w-[220px] mx-auto text-lg shadow-lg shadow-blue-500/30 animate-pulse px-4">
              {playCount >= 3 ? '광고 보고 계속하기' : '테스트 시작하기'}
            </button>
          </div>
        ) : !isPlaying && timeLeft === 0 ? (
          (() => {
            let grade = '';
            let gradeColor = '';
            let gradeEmoji = '';
            let comment = '';

            if (score > 5000) {
              grade = 'S+';
              gradeColor = '#FF6B9D';
              gradeEmoji = '🦅';
              comment = '독수리의 눈! 최상위 색감각!';
            } else if (score > 3000) {
              grade = 'S';
              gradeColor = '#9D4EDD';
              gradeEmoji = '🐯';
              comment = '호랑이의 눈! 뛰어난 색감각!';
            } else if (score > 2000) {
              grade = 'A+';
              gradeColor = '#3182F6';
              gradeEmoji = '🦊';
              comment = '여우의 눈! 우수한 색감각!';
            } else if (score > 1000) {
              grade = 'A';
              gradeColor = '#06B6D4';
              gradeEmoji = '🐶';
              comment = '강아지의 눈! 좋은 색감각!';
            } else if (score > 500) {
              grade = 'B';
              gradeColor = '#10B981';
              gradeEmoji = '🐱';
              comment = '고양이의 눈! 평균 이상!';
            } else {
              grade = 'C';
              gradeColor = '#F59E0B';
              gradeEmoji = '🦇';
              comment = '박쥐의 눈! 연습이 필요해요!';
            }

            return (
              <div className="text-center w-full max-w-sm animate-pop">
                <div className="text-7xl mb-6">{gradeEmoji}</div>
                <div
                  className="inline-block px-8 py-3 rounded-[20px] mb-4 font-black text-4xl shadow-lg"
                  style={{
                    backgroundColor: `${gradeColor}20`,
                    color: gradeColor,
                    border: `3px solid ${gradeColor}`
                  }}
                >
                  {grade}
                </div>
                <h1 className="text-2xl font-bold text-[#191F28] mb-2">게임 종료!</h1>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[20px] p-5 mb-4 border-2 border-blue-100">
                  <div className="text-sm text-[#6B7684] mb-1">최종 점수</div>
                  <div className="text-4xl font-black text-[#3182F6] mb-1">{score.toLocaleString()}점</div>
                  <div className="text-xs text-[#8B95A1]">레벨 {level} 달성</div>
                </div>
                <p className="text-sm font-medium mb-8" style={{ color: gradeColor }}>
                  {comment}
                </p>
                <div className="flex gap-3 mt-10 w-full max-w-[280px] mx-auto">
                  <button onClick={startGame} className="flex-1 h-[56px] rounded-[18px] bg-[#3182F6] text-white font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-blue-500/20">
                    다시 도전
                  </button>
                  <button onClick={() => navigate(-1)} className="flex-1 h-[56px] rounded-[18px] bg-[#E5E8EB] text-[#6B7684] font-bold text-lg active:scale-95 transition-transform">
                    홈으로
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6 px-2">
              <span className="text-[#4E5968] font-medium">남은 시간</span>
              <span className={`text-xl font-bold font-mono transition-colors ${showPenalty ? 'text-[#FF3B30] animate-shake scale-110' :
                timeLeft < 5 ? 'text-[#FF3B30] animate-pulse' : 'text-[#191F28]'
                }`}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>

            <div
              className="bg-white p-3 rounded-[24px] shadow-sm aspect-square w-full grid gap-2 transition-all mb-8"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className="w-full h-full rounded-[12px] active:scale-95 transition-transform shadow-sm border border-black/5"
                  style={getTileStyle(i)}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setIsPlaying(false);
                setTimeLeft(0);
              }}
              className="w-[120px] py-3 rounded-[16px] bg-[#E5E8EB] text-[#6B7684] font-bold text-sm active:scale-95 transition-transform"
            >
              그만하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
