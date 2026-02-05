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
        : `http://${window.location.hostname}:3001`
    );

    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-drawing`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
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

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};
