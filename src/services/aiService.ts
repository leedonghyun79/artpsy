// Removed GoogleGenerativeAI import as logic is moved to backend

export interface PsychologyResult {
  topic: string;
  personality: string;
  keywords: string[];
  description: string;
  relationships: string;
  workStyle: string;
  advice: string;
  shareText: string;
}

export const analyzeDrawing = async (topic: string, imageBase64: string): Promise<PsychologyResult> => {
  try {
    // Convert Data URL to Blob
    const imageRes = await fetch(imageBase64);
    const blob = await imageRes.blob();

    // Prepare FormData
    const formData = new FormData();
    formData.append("image", blob, "drawing.png");
    formData.append("topic", topic);

    // Call Backend API
    // Dynamic URL: Use Netlify backend when not in development or when explicitly set
    const API_BASE_URL = import.meta.env.VITE_API_URL || (
      import.meta.env.PROD
        ? 'https://preeminent-medovik-6eecc5.netlify.app'
        : `http://${window.location.hostname}:3005`
    );

    // 디버깅을 위한 API 주소 알럿 (앱인토스 환경용)
    // alert(`API 호출 시작: ${API_BASE_URL}/api/ai/analyze-drawing`);

    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-drawing`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(`[서버 에러] ${errorMsg}`);
    }

    const data = await response.json();

    // The backend returns the raw string from Gemini in 'analysis' field
    // We need to parse it as JSON
    let text = data.analysis;

    // console.log("AI Raw Response from Backend:", text);

    // Clean up response if it contains markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(text) as PsychologyResult;

  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    
    // User friendly error message
    let userMsg = "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("429") || errorMsg.includes("Resource exhausted") || errorMsg.includes("Too Many Requests")) {
      userMsg = "AI 분석 요청이 너무 많아 잠시 쉬고 있어요! 🍵\n1분 뒤에 다시 시도해주시면 감사하겠습니다.";
    } else {
      // 일반 에러의 경우 상세 정보 포함 (디버깅용)
      userMsg += `\n\n상세 정보: ${errorMsg}`;
    }

    alert(userMsg);
    throw error;
  }
};

export const analyzeColors = async (colors: string[]): Promise<string> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || (
      import.meta.env.PROD
        ? 'https://preeminent-medovik-6eecc5.netlify.app'
        : `http://${window.location.hostname}:3005`
    );

    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Color Analysis Failed:", error);
    throw error;
  }
};

export const analyzeMemory = async (selectedCards: string[]): Promise<string> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || (
      import.meta.env.PROD
        ? 'https://preeminent-medovik-6eecc5.netlify.app'
        : `http://${window.location.hostname}:3005`
    );

    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedCards }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Memory Analysis Failed:", error);
    throw error;
  }
};

