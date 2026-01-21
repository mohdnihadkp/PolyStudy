
import { GoogleGenAI, Chat, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  // Gracefully handle missing key, though environment should provide it.
  console.warn("API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Initialize the chat model configuration with dynamic context
const getChatModel = (department: string, semester: string, subject?: string, useThinking: boolean = false) => {
  const subjectContext = subject ? `The student is currently asking about the subject: "${subject}".` : "The student is asking about general department topics.";
  
  // Use gemini-3-pro-preview for thinking mode, otherwise default to flash
  const model = useThinking ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  
  // Configure thinking budget if enabled
  const thinkingConfig = useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: `You are **PolyStudy AI**, a highly specialized academic tutor for **Kerala Polytechnic (SITTTR/DTE Kerala)** Diploma students.
      
      **Current Student Context:**
      - **Department:** ${department}
      - **Semester:** ${semester}
      - **Current Subject:** ${subject || 'General'}
      - **Curriculum:** SITTTR (State Institute of Technical Teachers Training & Research), Kerala.
      
      **Strict Formatting Guidelines (Markdown):**
      1. **Headings:** Always use clear headings (## or ###) to separate different parts of your answer.
      2. **Lists:** Use bullet points (-) for features, steps, or lists. Numbered lists (1.) for sequences.
      3. **Bold:** Use **bold** for key terms, formulas, and important concepts.
      4. **Tables:** Use Markdown tables to compare two or more items (e.g., "Difference between X and Y").
      5. **Code Blocks:** Use \`\`\`language code blocks for any programming code, SQL queries, or mathematical derivations.
      
      **Your Teaching Strategy:**
      1.  **Syllabus Focus:** Always prioritize the topics explicitly listed in the Kerala Diploma syllabus for ${semester} ${department}. Avoid Bachelor's (B.Tech) level depth unless explicitly requested.
      2.  **Exam Pattern Awareness:** 
          - Identify **"Repeated Questions"** from previous years (e.g., "This is a frequent Part B essay question").
          - Distinguish between **Part A** (short definitions, 2-3 marks) and **Part B/C** (long explanations, problems) type content.
      3.  **Local Context:** Use examples relevant to Kerala industries (e.g., KSEB for Electrical, KSRTC for Auto/Mech, TechnoPark for CS).
      4.  **Problem Solving:** For engineering problems, show step-by-step working clearly.
      5.  **Language:** Use clear, simple English. If a concept is complex, explain it like you would to a diploma student, not a PhD.

      **Handling Unknowns:**
      If you are unsure about a specific SITTTR syllabus nuance, say "Based on general diploma standards..." but prioritize general engineering accuracy.
      `,
      ...thinkingConfig,
      tools: [{ googleSearch: {} }] // Enable search grounding for up-to-date info
    },
  });
};

export const startChatSession = (department: string, semester: string, subject?: string, useThinking: boolean = false): Chat => {
  return getChatModel(department, semester, subject, useThinking);
};

export const sendMessageToGemini = async (chat: Chat, message: string) => {
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const generateQuiz = async (subjectName: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a multiple-choice quiz about ${subjectName} based on Kerala Polytechnic Diploma level curriculum. Difficulty: ${difficulty}. 
            Create 5 questions that are typical for internal exams or semester exams.
            Provide the output in strict JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { 
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { 
                                        type: Type.INTEGER, 
                                        description: "Index of the correct option (0-3)" 
                                    },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswer"]
                            }
                        }
                    },
                    required: ["title", "questions"]
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

export const generateVeoVideo = async (file: File, prompt: string, aspectRatio: '16:9' | '9:16') => {
  // Check for API key selection support (needed for IDX/Project IDX environments)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const aistudio = (window as any).aistudio;
    if (!await aistudio.hasSelectedApiKey()) {
         await aistudio.openSelectKey();
    }
  }

  // Create a new client instance to ensure we use the latest API key (from selection if applicable)
  const currentApiKey = process.env.API_KEY || '';
  const aiClient = new GoogleGenAI({ apiKey: currentApiKey });

  // Convert File to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data prefix (e.g. data:image/png;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Call the Veo model
  let operation = await aiClient.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this image', // Prompt is required/recommended
    image: {
        imageBytes: base64Data,
        mimeType: file.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  // Poll for completion (Veo generation takes time)
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10s poll interval
    operation = await aiClient.operations.getVideosOperation({operation: operation});
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("No video URI returned from generation.");
  }

  // Fetch the actual video content. Note: API Key must be appended.
  const videoRes = await fetch(`${downloadLink}&key=${currentApiKey}`);
  if (!videoRes.ok) {
    throw new Error("Failed to download generated video.");
  }
  
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};
