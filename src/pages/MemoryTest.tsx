import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdMob } from '../hooks/useAdMob';

type GameState = 'start' | 'memorize' | 'play' | 'success' | 'fail';

export default function MemoryTest() {
  const navigate = useNavigate();
  const { showInterstitial } = useAdMob();
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('start');
  const [tiles, setTiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [showNumbers, setShowNumbers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playCount, setPlayCount] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const countKey = `memory_play_count_${today}`;
    setPlayCount(parseInt(localStorage.getItem(countKey) || '0'));
  }, []);

  // Constants
  const GRID_SIZE = 5; // 5x5 grid
  const INITIAL_TIME = 30; // 초기 시간 (초)

  // 타이머 관리
  useEffect(() => {
    if (gameState === 'play' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timer);
            setGameState('fail');
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const startGame = async () => {
    // 3회 이상 플레이 시 전면 광고 로직
    const today = new Date().toDateString();
    const countKey = `memory_play_count_${today}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0');

    if (currentCount >= 3) {
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

    setTimeLeft(INITIAL_TIME);
    generateLevel(1);
  };

  const generateLevel = (lvl: number) => {
    setLevel(lvl);
    setGameState('memorize');
    setNextNumber(1);
    // 레벨업 시 시간 보너스 (1초)
    if (lvl > 1) {
      setTimeLeft(prev => Math.min(INITIAL_TIME, prev + 1));
    }

    // Generate unique random positions
    const count = Math.min(lvl + 3, 25); // Start with 4 tiles, max 25
    const positions = new Set<string>();
    const newTiles = [];

    while (newTiles.length < count) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const key = `${x},${y}`;

      if (!positions.has(key)) {
        positions.add(key);
        newTiles.push({ id: newTiles.length + 1, x, y });
      }
    }
    setTiles(newTiles);
    setShowNumbers(true);

    // time to memorize depends on quantity
    // but classic chimpanzee test hides it quickly if you click start, 
    // here we auto-hide after some time for simplicity
    setTimeout(() => {
      setShowNumbers(false);
      setGameState('play');
    }, Math.max(1000, lvl * 300)); // Minimum 1s, increases slightly
  };

  const handleTileClick = (id: number) => {
    if (gameState !== 'play') return;

    if (id === nextNumber) {
      if (id === tiles.length) {
        // Level Complete - 마지막 숫자도 표시
        setNextNumber(id + 1); // 마지막 숫자를 표시하기 위해 증가
        setGameState('success');
        setTimeout(() => {
          generateLevel(level + 1);
        }, 800); // 약간 짧게 조정
      } else {
        setNextNumber(id + 1);
      }
    } else {
      // Wrong - Visual Penalty Effect
      setShowPenalty(true);
      setTimeout(() => setShowPenalty(false), 500);

      const newTime = Math.max(0, timeLeft - 3.0);
      setTimeLeft(newTime);
      if (newTime <= 0) {
        setGameState('fail');
      }
    }
  };

  const retry = () => {
    setTimeLeft(INITIAL_TIME);
    generateLevel(1);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-[#4E5968] active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="text-[18px] font-bold text-[#191F28] tracking-tight">기억력 테스트</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="font-bold text-lg text-[#191F28]">Lv. {level}</div>
          {(gameState === 'play' || gameState === 'memorize') && (
            <div className={`font-bold text-lg font-mono transition-all ${showPenalty ? 'text-[#FF3B30] animate-shake scale-110' :
                timeLeft < 10 ? 'text-[#FF3B30] animate-pulse' : 'text-[#3182F6]'
              }`}>
              ⏱️ {timeLeft.toFixed(1)}s
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 animate-enter">
        {gameState === 'start' && (
          <div className="text-center w-full max-w-sm">
            <div className="text-7xl mb-6 animate-pop">🧠</div>
            <h1 className="text-2xl font-bold text-[#191F28] mb-3">순간 기억력 테스트</h1>
            <p className="text-[#6B7684] mb-8 leading-relaxed">
              숫자의 위치를 기억하세요.<br />
              숫자가 사라지면 1부터 순서대로<br />
              눌러야 합니다.
            </p>
            <button onClick={startGame} className="btn-toss w-[220px] mx-auto text-lg shadow-lg shadow-blue-500/30 animate-pulse px-4">
              {playCount >= 3 ? '광고 보고 계속하기' : '테스트 시작하기'}
            </button>
          </div>
        )}

        {gameState === 'fail' && (() => {
          // 점수 계산 (레벨 기반)
          const score = Math.max(0, (level - 1) * 100);

          // 등급 계산
          let grade = '';
          let gradeColor = '';
          let gradeEmoji = '';
          let comment = '';

          if (level >= 15) {
            grade = 'S+';
            gradeColor = '#FF6B9D';
            gradeEmoji = '👑';
            comment = '천재적인 기억력! 상위 0.1%입니다!';
          } else if (level >= 12) {
            grade = 'S';
            gradeColor = '#9D4EDD';
            gradeEmoji = '🌟';
            comment = '놀라운 기억력! 상위 1%입니다!';
          } else if (level >= 10) {
            grade = 'A+';
            gradeColor = '#3182F6';
            gradeEmoji = '⭐';
            comment = '뛰어난 기억력! 상위 5%입니다!';
          } else if (level >= 7) {
            grade = 'A';
            gradeColor = '#06B6D4';
            gradeEmoji = '✨';
            comment = '우수한 기억력! 상위 20%입니다!';
          } else if (level >= 5) {
            grade = 'B';
            gradeColor = '#10B981';
            gradeEmoji = '💚';
            comment = '평균 이상의 기억력이에요!';
          } else if (level >= 3) {
            grade = 'C';
            gradeColor = '#F59E0B';
            gradeEmoji = '💛';
            comment = '평균 수준의 기억력이에요!';
          } else {
            grade = 'D';
            gradeColor = '#8B95A1';
            gradeEmoji = '💪';
            comment = '연습하면 더 좋아질 거예요!';
          }

          return (
            <div className="text-center w-full max-w-sm animate-pop">
              <div className="text-7xl mb-6">{gradeEmoji}</div>

              {/* 등급 표시 */}
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

              {/* 점수 표시 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[20px] p-5 mb-4 border-2 border-blue-100">
                <div className="text-sm text-[#6B7684] mb-1">최종 점수</div>
                <div className="text-4xl font-black text-[#3182F6] mb-1">{score.toLocaleString()}</div>
                <div className="text-xs text-[#8B95A1]">레벨 {level} 달성</div>
              </div>

              <p className="text-sm font-medium mb-8" style={{ color: gradeColor }}>
                {comment}
              </p>

              <div className="flex gap-3 mt-10 w-full max-w-[280px] mx-auto">
                <button onClick={retry} className="flex-1 h-[56px] rounded-[18px] bg-[#3182F6] text-white font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-blue-500/20">
                  다시 도전
                </button>
                <button onClick={() => navigate('/')} className="flex-1 h-[56px] rounded-[18px] bg-[#E5E8EB] text-[#6B7684] font-bold text-lg active:scale-95 transition-transform">
                  홈으로
                </button>
              </div>
            </div>
          );
        })()}

        {(gameState === 'memorize' || gameState === 'play' || gameState === 'success') && (
          <>
            <div className="w-full max-w-[340px] aspect-square bg-white rounded-[24px] shadow-sm p-4 relative grid grid-cols-5 grid-rows-5 gap-2 border border-[#E5E8EB]">
              {tiles.map((tile) => {
                const isClicked = tile.id < nextNumber;
                const shouldShowNumber = showNumbers || isClicked;

                return (
                  <button
                    key={tile.id}
                    className={`
                       w-full h-full rounded-[12px] flex items-center justify-center text-2xl font-bold transition-all
                       ${isClicked
                        ? 'bg-[#E5E8EB] text-[#8B95A1] border-2 border-[#C9CDD2] scale-95 shadow-inner'
                        : shouldShowNumber
                          ? 'bg-white text-[#191F28] border-2 border-[#191F28] shadow-sm active:scale-90'
                          : 'bg-[#191F28] text-transparent border-none shadow-sm active:scale-90'
                      }
                     `}
                    style={{
                      gridColumn: tile.x + 1,
                      gridRow: tile.y + 1
                    }}
                    onClick={() => handleTileClick(tile.id)}
                    disabled={gameState !== 'play' || isClicked}
                  >
                    {shouldShowNumber ? tile.id : ''}
                  </button>
                );
              })}
            </div>

            {gameState === 'play' && (
              <button
                onClick={() => {
                  setGameState('fail');
                  setTimeLeft(0);
                }}
                className="mt-8 w-[120px] py-3 rounded-[16px] bg-[#E5E8EB] text-[#6B7684] font-bold text-sm active:scale-95 transition-transform"
              >
                그만하기
              </button>
            )}
          </>
        )}

        {gameState === 'memorize' && (
          <div className="mt-8 text-center animate-pulse">
            <p className="text-[#3182F6] font-bold">위치를 기억하세요!</p>
          </div>
        )}
      </main>
    </div>
  );
}
