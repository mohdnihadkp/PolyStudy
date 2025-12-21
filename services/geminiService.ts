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
      
      **Your Teaching Strategy:**
      1.  **Syllabus Focus:** Always prioritize the topics explicitly listed in the Kerala Diploma syllabus for ${semester} ${department}. Avoid Bachelor's (B.Tech) level depth unless explicitly requested.
      2.  **Exam Pattern Awareness:** 
          - Identify **"Repeated Questions"** from previous years (e.g., "This is a frequent Part B essay question").
          - Distinguish between **Part A** (short definitions, 2-3 marks) and **Part B/C** (long explanations, problems) type content.
      3.  **Local Context:** Use examples relevant to Kerala industries (e.g., KSEB for Electrical, KSRTC for Auto/Mech, TechnoPark for CS).
      4.  **Problem Solving:** For engineering problems, show step-by-step working clearly.
      5.  **Language:** Use clear, simple English. If a concept is complex, explain it like you would to a diploma student, not a PhD.

      **Response Formatting:**
      - Use **Bold** for key terms.
      - Use **Bulleted Lists** for features/types.
      - Use **Tables** for comparisons (e.g., "Difference between X and Y").
      - Use **Code Blocks** for programming questions.

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
}

// --- VEO VIDEO GENERATION ---

export const generateVeoVideo = async (
  imageFile: File, 
  prompt: string, 
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
    // 1. Mandatory API Key Selection for Veo
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }

    // 2. Convert Image to Base64
    const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data url prefix (e.g., "data:image/png;base64,")
            const data = result.split(',')[1]; 
            resolve(data);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(imageFile);
    });

    // 3. Create a NEW instance to pick up the potentially newly selected key
    const currentApiKey = process.env.API_KEY || '';
    const freshAi = new GoogleGenAI({ apiKey: currentApiKey });

    try {
        // 4. Start Video Generation Operation
        let operation = await freshAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "Animate this image cinematically",
            image: {
                imageBytes: base64Image,
                mimeType: imageFile.type,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        // 5. Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await freshAi.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned from Veo.");

        // 6. Download the video bytes (Requires API key appended)
        const response = await fetch(`${videoUri}&key=${currentApiKey}`);
        if (!response.ok) throw new Error("Failed to download generated video.");
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error: any) {
        // Handle "Requested entity was not found" by resetting key
        if (error.message?.includes("Requested entity was not found") && window.aistudio) {
             await window.aistudio.openSelectKey();
             throw new Error("API Key session invalid. Please select your key again and retry.");
        }
        console.error("Veo Generation Error:", error);
        throw error;
    }
};