
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
      1. **Headings:** Use clear headings (## or ###) to separate sections.
      2. **Emphasis:** Use **bold** for terms and > Blockquotes for key takeaways or definitions.
      3. **Tables:** Use Markdown tables to compare items (e.g., "Difference between X and Y").
      4. **Code:** Use \`\`\`language blocks for code/SQL/formulas.
      5. **Lists:** Use concise bullet points.
      
      **Teaching Strategy:**
      1. **Diploma Level:** Explanations must be simple, clear, and suited for a 3-year diploma student. Avoid complex B.Tech/Research level jargon unless asked.
      2. **Exam Focus:** Mention if a topic is a "Repeated Question" or "Important for Part B".
      3. **Local Context:** Use Kerala-relevant examples where possible.
      
      **Follow-up Protocol:**
      At the very end of your response, strictly add a section starting with the exact text "---SUGGESTIONS---" followed by 3 short, relevant follow-up questions separated by a pipe character "|".
      Example:
      [Your Answer Here...]
      ---SUGGESTIONS---
      What is the difference between X and Y? | Explain the working principle of Z | Solve a problem on this topic
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
        const difficultyPrompt = {
            easy: "Focus on basic definitions, units, and simple concepts. Suitable for Part A (2-3 mark) questions.",
            medium: "Include conceptual questions, working principles, and standard applications. Suitable for standard semester exams.",
            hard: "Include problem-solving, deep analysis, and complex scenarios. Suitable for competitive prep or Part C questions."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a multiple-choice quiz about ${subjectName} based on Kerala Polytechnic Diploma curriculum. 
            Difficulty Level: ${difficulty.toUpperCase()}. ${difficultyPrompt[difficulty]}
            
            Create 5 questions.
            For the 'explanation', provide a clear, detailed reasoning suitable for a diploma student. Reference standard textbooks where applicable.
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
                                required: ["question", "options", "correctAnswer", "explanation"]
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

export const generateFlashcards = async (subjectName: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 10 study flashcards for the subject "${subjectName}" based on the Kerala Polytechnic syllabus.
            Focus on key terms, important definitions, formulas, and acronyms.
            Output a JSON array of objects with "front" (the term/question) and "back" (the definition/answer).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flashcards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    front: { type: Type.STRING },
                                    back: { type: Type.STRING }
                                },
                                required: ["front", "back"]
                            }
                        }
                    },
                    required: ["flashcards"]
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw error;
    }
};

export const generateVeoVideo = async (file: File, prompt: string, aspectRatio: '16:9' | '9:16') => {
  // Check for API key selection support
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const aistudio = (window as any).aistudio;
    if (!await aistudio.hasSelectedApiKey()) {
         await aistudio.openSelectKey();
    }
  }

  const currentApiKey = process.env.API_KEY || '';
  const aiClient = new GoogleGenAI({ apiKey: currentApiKey });

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  let operation = await aiClient.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this image', 
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

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await aiClient.operations.getVideosOperation({operation: operation});
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("No video URI returned from generation.");
  }

  const videoRes = await fetch(`${downloadLink}&key=${currentApiKey}`);
  if (!videoRes.ok) {
    throw new Error("Failed to download generated video.");
  }
  
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};
