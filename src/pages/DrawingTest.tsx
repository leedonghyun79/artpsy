import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Topic = 'person' | 'house' | 'tree' | 'fish';
type Stage = 'topic' | 'drawing' | 'preview' | 'ad' | 'result';

import { analyzeDrawing, PsychologyResult } from '../services/aiService';
import { SketchPicker } from 'react-color';

const LOADING_MESSAGES = [
  "그림의 선을 분석하고 있어요...",
  "특징적인 패턴을 찾고 있어요...",
  "숨겨진 심리를 파악하는 중이에요...",
  "결과 리포트를 작성하고 있어요..."
];



import { useAdMob } from '../hooks/useAdMob';

export default function DrawingTest() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage>('topic');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [result, setResult] = useState<PsychologyResult | null>(null);
  const [hasUsedFreeTest, setHasUsedFreeTest] = useState(false);
  const [drawingImage, setDrawingImage] = useState<string>("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>('#333D4B');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);

  const { showInterstitial, isLoading: isAdLoading, status: adStatus } = useAdMob();

  // Refs for drawing logic to access current state without re-binding events
  const colorRef = useRef('#333D4B');
  const isEraserRef = useRef(false);
  const showPickerRef = useRef(false);
  const strokeLengthRef = useRef(0);
  // Bounding box for the drawing to ensure it's not a tiny squiggle
  const bboxRef = useRef({ minX: 10000, minY: 10000, maxX: 0, maxY: 0 });

  // Check free trial
  useEffect(() => {
    const lastFreeTest = localStorage.getItem('lastFreeTest');
    const today = new Date().toDateString();
    if (lastFreeTest === today) {
      setHasUsedFreeTest(true);
    }
  }, []);

  useEffect(() => {
    // Stage가 변경될 때마다 타이틀 설정
    document.title = stage === 'result' ? '분석 결과' : '그림심리테스트';
  }, [stage]);

  useEffect(() => {
    if (stage === 'ad' && drawingImage) {
      // Start Progress Animation
      const progressTimer = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 90) return 90; // Stall at 90% until API responds
          return prev + 1.5;
        });
      }, 50);

      // Rotate Loading Messages
      const msgTimer = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);

      // Call AI Service
      analyzeDrawing(selectedTopic!, drawingImage)
        .then((analysisResult) => {
          setResult(analysisResult);
          setAdProgress(100);
          setTimeout(() => setStage('result'), 500);
        })
        .catch((err) => {
          console.error("Analysis Error:", err);
          alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
          setStage('preview');
        })
        .finally(() => {
          clearInterval(progressTimer);
          clearInterval(msgTimer);
        });

      return () => {
        clearInterval(progressTimer);
        clearInterval(msgTimer);
      };
    }
  }, [stage, drawingImage, selectedTopic]);

  // Canvas Setup
  useEffect(() => {
    if (stage === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High DPI scaling
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;

      ctx.scale(ratio, ratio);

      // Initial white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Initial Context Setup 
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let drawing = false;
      let lastX = 0;
      let lastY = 0;

      const getPos = (e: MouseEvent | TouchEvent) => {
        const r = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - r.left,
          y: clientY - r.top
        };
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => {
        // Close color picker if open
        if (showPickerRef.current) {
          setShowPicker(false);
        }

        drawing = true;
        const { x, y } = getPos(e);
        lastX = x;
        lastY = y;

        setCursorPos({ x, y });
        setIsTouching(true);

        // Dynamic Style Update per stroke
        ctx.strokeStyle = isEraserRef.current ? '#FFFFFF' : colorRef.current;
        ctx.lineWidth = isEraserRef.current ? 20 : 3;
      };

      const draw = (e: MouseEvent | TouchEvent) => {
        if (!drawing) return;
        if (e.cancelable) e.preventDefault(); // Prevent scroll while drawing

        const { x, y } = getPos(e);

        setCursorPos({ x, y });

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Only track drawing volume for pens (not eraser)
        if (!isEraserRef.current) {
          const dist = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
          strokeLengthRef.current += dist;

          // Update bounding box
          bboxRef.current.minX = Math.min(bboxRef.current.minX, x);
          bboxRef.current.minY = Math.min(bboxRef.current.minY, y);
          bboxRef.current.maxX = Math.max(bboxRef.current.maxX, x);
          bboxRef.current.maxY = Math.max(bboxRef.current.maxY, y);
        }

        lastX = x;
        lastY = y;
      };

      const stopDrawing = () => {
        drawing = false;
        setIsTouching(false);
      };

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);

      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);

        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    }
  }, [stage]);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setStage('drawing');

    // Reset tools and drawing volume
    setCurrentColor('#333D4B');
    setIsEraser(false);
    colorRef.current = '#333D4B';
    isEraserRef.current = false;
    strokeLengthRef.current = 0;
    bboxRef.current = { minX: 10000, minY: 10000, maxX: 0, maxY: 0 };
  };

  const handleColorChange = (color: any) => {
    const newColor = color.hex;
    setCurrentColor(newColor);
    setIsEraser(false);
    colorRef.current = newColor;
    isEraserRef.current = false;
  };


  const handlePenSelect = () => {
    setIsEraser(false);
    isEraserRef.current = false;
    setShowPicker(false);
    showPickerRef.current = false;
  };

  const handleEraserSelect = () => {
    setIsEraser(true);
    isEraserRef.current = true;
    setShowPicker(false);
    showPickerRef.current = false;
  };

  const handleFinishDrawing = () => {
    // 획의 총 길이가 너무 짧거나 그림의 크기가 너무 작으면 경고 
    const { minX, minY, maxX, maxY } = bboxRef.current;
    const width = maxX - minX;
    const height = maxY - minY;

    if (strokeLengthRef.current < 800 || width < 120 || height < 120) {
      setShowWarningModal(true);
      return;
    }

    if (canvasRef.current) {
      const image = canvasRef.current.toDataURL('image/png');
      setDrawingImage(image);
      setStage('preview');
    }
  };

  const handleStartAnalysis = async () => {
    try {
      // Show Interstitial Ad before analysis
      await showInterstitial();
    } catch (e) {
      console.error('Ad Show Failed:', e);
      // Proceed even if ad fails
    }

    if (!hasUsedFreeTest) {
      const today = new Date().toDateString();
      localStorage.setItem('lastFreeTest', today);
      setHasUsedFreeTest(true);
    }

    setStage('ad');
    setAdProgress(0);
  };
  // Handle Share
  const handleShare = async () => {
    if (result) {
      // let shareLink = "https://artpsy.apps.tossmini.com";
      let shareLink;
      // Try to generate dynamic Toss Share Link
      try {
        // @apps-in-toss/web-framework must be installed
        const { getTossShareLink } = await import('@apps-in-toss/web-framework');
        shareLink = await getTossShareLink('intoss://artpsy');
      } catch (e) {
        console.log('Toss framework not available, using default link');
      }

      // Create pretty text for sharing
      const shareText = `[🎨 그림 심리 테스트 결과]

주제: ${topicData.find(t => t.id === selectedTopic)?.title || selectedTopic} 그리기
성격: ${result.personality}

🔍 상세 분석
${result.description}

❤️ 대인관계
${result.relationships}

💼 업무 스타일
${result.workStyle}

🍀 행운의 조언
${result.advice}

-------------------
나도 해보기 👉 ${shareLink}`;

      // 1. Try Native Web Share API (Mobile/HTTPS)
      if (typeof navigator.share !== 'undefined') {
        try {
          await navigator.share({
            title: '그림 심리 테스트 결과',
            text: shareText,
            // url: window.location.href // URL을 빼고 텍스트만 공유하여, 텍스트 전체가 메신저에 입력되도록 유도
          });
          return;
        } catch (err) {
          console.log('Share canceled or failed, falling back to clipboard', err);
        }
      }

      // 2. Clipboard Fallback
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
        } else {
          // Insecure context fallback
          const textArea = document.createElement("textarea");
          textArea.value = shareText;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (!successful) throw new Error('Copy failed');
        }
        alert('결과가 텍스트로 복사되었어요! 원하시는 곳에 붙여넣기 하세요.');
      } catch (err) {
        console.error("Copy failed:", err);
        alert('공유하기를 사용할 수 없는 환경입니다.');
      }
    }
  };

  const topicData = [
    { id: 'person' as Topic, title: '사람', emoji: '👤', desc: '자아상과 타인에 대한 시선을 파악해요', labels: { rel: '대인관계', work: '사회적 에너지' } },
    { id: 'house' as Topic, title: '집', emoji: '🏠', desc: '가족 관계와 내면의 안정감을 분석해요', labels: { rel: '가족 내 상호작용', work: '내적 적응' } },
    { id: 'tree' as Topic, title: '나무', emoji: '🌳', desc: '무의식적 자아와 내면의 에너지를 알아봐요', labels: { rel: '정서적 상호관계', work: '추동력 및 의지' } },
    { id: 'fish' as Topic, title: '물고기', emoji: '🐟', desc: '무의식 속 감정과 현재의 스트레스를 읽어요', labels: { rel: '감정적 교류', work: '상황 적응' } }
  ];

  useEffect(() => {
    document.title = stage === 'result' ? '분석 결과' : '그림심리테스트';
  }, [stage]);

  return (
    <div className="min-h-screen bg-[#FFF9F2] pb-10">
      <main className="px-5 pt-10 animate-enter">
        {/* Topic Selection */}
        {stage === 'topic' && (
          <>
            <h2 className="t-h1 text-[#191F28] mb-8">
              어떤 그림을<br />그려볼까요?
            </h2>
            <div className="space-y-4">
              {topicData.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className="surface w-full p-6 flex items-center justify-between text-left touch-effect"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[20px] bg-[#F9FAFB] flex items-center justify-center text-3xl">
                      {topic.emoji}
                    </div>
                    <div>
                      <div className="text-[18px] font-bold text-[#191F28] mb-1">{topic.title} 그리기</div>
                      <div className="text-[14px] text-[#8B95A1] font-medium">{topic.desc}</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[#D1D6DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Drawing Canvas */}
        {stage === 'drawing' && (
          <div className="flex flex-col h-[calc(100vh-140px)] animate-enter">
            <div className="flex justify-between items-end mb-4 px-1">
              <h2 className="t-h2 text-[#191F28]">{topicData.find(t => t.id === selectedTopic)?.title} 그리기</h2>
              <p className="text-[#6B7684] text-sm">마음가는대로 자유롭게</p>
            </div>

            {/* Tool Palette */}
            <div className="bg-white rounded-[24px] p-4 mb-4 shadow-sm border border-[#F2F4F6] animate-enter delay-100 flex items-center justify-between z-40 relative">

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPicker(!showPicker);
                      showPickerRef.current = !showPicker;
                    }}
                    className={`w-10 h-10 rounded-full border-[3px] shadow-sm transition-transform active:scale-95 ${showPicker
                      ? 'border-[#3182F6]'
                      : 'border-transparent'
                      }`}
                    style={{ backgroundColor: currentColor }}
                    aria-label="Color Picker"
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[#8B95A1] whitespace-nowrap">색상 변경</span>

                  {showPicker && (
                    <div className="absolute top-12 left-0 z-[100]">
                      <div className="fixed inset-0 z-[99]" onClick={() => {
                        setShowPicker(false);
                        showPickerRef.current = false;
                      }} />
                      <div className="relative z-[100] shadow-xl rounded-lg overflow-hidden">
                        <SketchPicker
                          color={currentColor}
                          onChange={handleColorChange}
                          disableAlpha={true}
                          presetColors={[]}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col text-xs text-[#8B95A1] font-medium">
                  <span>현재 색상</span>
                  <span className="uppercase text-[#333D4B]">{currentColor}</span>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-[#E5E8EB] mx-2"></div>

              <div className="flex gap-1">
                <button
                  onClick={handlePenSelect}
                  className={`p-2 rounded-[14px] transition-all flex flex-col items-center justify-center gap-1 min-w-[50px] ${!isEraser
                    ? 'bg-[#E8F3FF] text-[#3182F6]'
                    : 'text-[#8B95A1] hover:bg-[#F2F4F6]'
                    }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="text-[11px] font-medium">펜</span>
                </button>

                <button
                  onClick={handleEraserSelect}
                  className={`p-2 rounded-[14px] transition-all flex flex-col items-center justify-center gap-1 min-w-[50px] ${isEraser
                    ? 'bg-[#E8F3FF] text-[#3182F6]'
                    : 'text-[#8B95A1] hover:bg-[#F2F4F6]'
                    }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10m-1-5l-4.75 4.75a2 2 0 01-2.83 0l-4.5-4.5a2 2 0 010-2.83L11 6l7 7-4.5 4.5" />
                  </svg>
                  <span className="text-[11px] font-medium">지우개</span>
                </button>
              </div>
            </div>

            <div className="flex-1 surface overflow-hidden relative mb-6 border border-[#E5E8EB] cursor-none touch-none">
              <canvas ref={canvasRef} className="w-full h-full" />

              {/* Virtual Cursor (Follower) */}
              {isTouching && (
                <div
                  className="pointer-events-none absolute z-50 rounded-full border border-black/10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: isEraser ? '24px' : '10px',
                    height: isEraser ? '24px' : '10px',
                    backgroundColor: isEraser ? 'rgba(255, 255, 255, 0.8)' : currentColor,
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {isEraser && (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#8B95A1] opacity-50" />
                  )}
                </div>
              )}
            </div>

            <button onClick={handleFinishDrawing} className="btn-toss">
              다 그렸어요
            </button>
          </div>
        )}

        {/* Preview Stage - 그림 미리보기 */}
        {stage === 'preview' && (
          <div className="flex flex-col h-[calc(100vh-140px)] animate-enter">
            <div className="text-center mb-6">
              <h2 className="t-h2 text-[#191F28] mb-2">그림이 완성되었어요!</h2>
              <p className="text-[#6B7684] text-sm">AI가 당신의 그림을 분석해드릴게요</p>
            </div>

            {/* 그림 미리보기 */}
            <div className="flex-1 surface overflow-hidden relative mb-6 border border-[#E5E8EB] flex items-center justify-center">
              {drawingImage && (
                <img
                  src={drawingImage}
                  alt="그린 그림"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartAnalysis}
                className="w-full btn-toss bg-[#3182F6] text-white shadow-lg shadow-blue-500/30 order-1 animate-pulse"
              >
                광고보고 결과 확인하기
              </button>
              <button
                onClick={() => {
                  setStage('drawing');
                  strokeLengthRef.current = 0;
                  bboxRef.current = { minX: 10000, minY: 10000, maxX: 0, maxY: 0 };
                }}
                className="w-full btn-toss bg-[#E5E8EB] text-[#4E5968] hover:bg-[#D1D6DB] order-2"
              >
                다시 그리기
              </button>
            </div>
          </div>
        )}

        {/* Loading / Ad Simulation */}
        {
          stage === 'ad' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-enter px-6">
              <div className="relative mb-10">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(49,130,246,0.1)] flex items-center justify-center relative z-10 border border-[#F2F4F6]">
                  <span className="text-5xl animate-bounce-slow">🧐</span>
                </div>
              </div>

              <div className="space-y-4 max-w-xs">
                <h3 className="text-[22px] font-bold text-[#191F28] leading-tight">
                  그림을 정밀하게<br />분석하고 있어요
                </h3>
                <p className="text-[#8B95A1] font-medium transition-all duration-500 min-h-[24px]">
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full max-w-[200px] h-1.5 bg-[#E5E8EB] rounded-full mt-10 overflow-hidden">
                <div
                  className="h-full bg-[#3182F6] transition-all duration-300 ease-out"
                  style={{ width: `${adProgress}%` }}
                ></div>
              </div>
            </div>
          )
        }


        {/* Full-screen Ad Loading Overlay */}
        {isAdLoading && (
          <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-enter">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-[280px] text-center shadow-2xl">
              <div className="w-16 h-16 bg-[#F2F4F6] rounded-full flex items-center justify-center mx-auto mb-5">
                <div className="w-8 h-8 border-4 border-[#3182F6] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h4 className="text-[18px] font-bold text-[#191F28] mb-2">광고 준비 중</h4>
              <p className="text-[#8B95A1] text-[14px] font-medium leading-relaxed">
                잠시만 기다려 주세요.<br />
                {adStatus === 'Ready' ? '광고를 불러오고 있습니다.' : adStatus}
              </p>
            </div>
          </div>
        )}


        {/* Result Report */}
        {
          stage === 'result' && result && (
            <div className="animate-enter pb-10">
              <div className="text-center mb-8 pt-8 animate-enter">
                <div className="relative inline-block mb-6 animate-pop">
                  <div className="absolute inset-0 bg-[#FFD260]/20 rounded-full blur-2xl scale-150 transform -translate-y-2"></div>
                  <div className="text-[80px] relative z-10 drop-shadow-sm">{topicData.find(t => t.id === selectedTopic)?.emoji}</div>
                </div>
                <h2 className="text-[26px] font-bold text-[#2D2826] mb-3 leading-tight px-4 break-keep tracking-tight">
                  {result.personality}
                </h2>

                <div className="flex gap-2.5 justify-center flex-wrap px-6 mt-3">
                  {result.keywords.map((k, i) => (
                    <span
                      key={i}
                      className="px-4 py-2.5 bg-white text-[#5C4D46] rounded-[20px] text-[15px] font-semibold shadow-[0_4px_12px_rgba(200,180,160,0.15)] border border-[rgba(255,240,220,0.6)] animate-enter transition-transform hover:scale-105 active:scale-95"
                      style={{ animationDelay: `${i * 100 + 300}ms`, animationFillMode: 'both' }}
                    >
                      <span className="text-[#FF9C68] mr-1">#</span>
                      {k.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-5 px-5">
                {/* Detailed Description */}
                <div className="surface p-7 !rounded-[32px] !shadow-[0_8px_30px_rgba(210,195,180,0.15)] bg-white/80 backdrop-blur-sm border border-white/60">
                  <h3 className="text-[19px] font-bold text-[#423C38] mb-4 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center text-lg">🔍</span>
                    상세 심층 분석
                  </h3>
                  <p className="text-[#5C5550] leading-[1.7] whitespace-pre-line text-[16px] tracking-wide">
                    {result.description}
                  </p>
                </div>

                {/* Relationships */}
                {result.relationships && (
                  <div className="surface p-7 !rounded-[32px] !shadow-[0_8px_30px_rgba(210,195,180,0.15)] bg-white/80 backdrop-blur-sm border border-white/60">
                    <h3 className="text-[19px] font-bold text-[#423C38] mb-4 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#F0F5FF] flex items-center justify-center text-lg">🤝</span>
                      {topicData.find(t => t.id === selectedTopic)?.labels.rel || '대인관계'} 성향
                    </h3>
                    <p className="text-[#5C5550] leading-[1.7] whitespace-pre-line text-[16px] tracking-wide">
                      {result.relationships}
                    </p>
                  </div>
                )}

                {/* Work Style */}
                {result.workStyle && (
                  <div className="surface p-7 !rounded-[32px] !shadow-[0_8px_30px_rgba(210,195,180,0.15)] bg-white/80 backdrop-blur-sm border border-white/60">
                    <h3 className="text-[19px] font-bold text-[#423C38] mb-4 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#E6F9F0] flex items-center justify-center text-lg">💼</span>
                      {topicData.find(t => t.id === selectedTopic)?.labels.work || '일/수행'} 스타일
                    </h3>
                    <p className="text-[#5C5550] leading-[1.7] whitespace-pre-line text-[16px] tracking-wide">
                      {result.workStyle}
                    </p>
                  </div>
                )}

                {/* Advice */}
                {result.advice && (
                  <div className="surface p-7 !rounded-[32px] !shadow-[0_8px_30px_rgba(210,195,180,0.15)] bg-[#FFF8F0] border border-[#FFE8CC]">
                    <h3 className="text-[19px] font-bold text-[#7A5C2D] mb-4 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">💡</span>
                      행운의 조언
                    </h3>
                    <p className="text-[#6B5A4E] leading-[1.7] whitespace-pre-line text-[16px] font-medium tracking-wide">
                      {result.advice}
                    </p>
                  </div>
                )}
              </div>


              <div className="flex gap-3 mt-10 px-5">
                <button
                  onClick={handleShare}
                  className="flex-1 btn-toss bg-[#FF9C68] hover:bg-[#FF884D] text-white shadow-[0_8px_20px_rgba(255,156,104,0.3)] !rounded-[24px] !h-[60px] text-[18px]"
                >
                  공유하기
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 btn-toss bg-[#EBE5DE] text-[#6E655F] hover:bg-[#DDD6CE] !rounded-[24px] !h-[60px] text-[18px]"
                >
                  홈으로
                </button>
              </div>
            </div>
          )
        }

        {/* Custom Warning Modal */}
        {showWarningModal && (
          <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-enter">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-[320px] text-center shadow-2xl animate-pop">
              <div className="text-5xl mb-6">🎨</div>
              <h4 className="text-[22px] font-bold text-[#191F28] mb-8 leading-tight">
                조금만 더<br />정성껏 그려볼까요?
              </h4>
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full h-[56px] bg-[#3182F6] text-white rounded-[18px] font-bold text-[17px] active:scale-95 transition-transform"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </main >
    </div >
  );
}
