import { GoogleGenAI, Type } from "@google/genai";
import type { Course } from '../types';

// Fix: Initialize the Gemini API client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const courseSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "Uma breve descrição do curso (2-3 frases)."
        },
        icon: {
            type: Type.STRING,
            description: "O ícone mais apropriado para o curso. Deve ser uma das seguintes opções: 'tax', 'investment', ou 'budget'."
        },
        difficulty: {
            type: Type.STRING,
            description: "O nível de dificuldade do curso. Deve ser 'beginner' ou 'intermediate'."
        },
        lessons: {
            type: Type.ARRAY,
            description: "Uma lista de 3 a 4 lições.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "O título da lição."
                    },
                    content: {
                        type: Type.STRING,
                        description: "O conteúdo educacional da lição, formatado em markdown (parágrafos, listas). Mínimo de 3 parágrafos."
                    },
                    quiz: {
                        type: Type.ARRAY,
                        description: "Um quiz com 3 perguntas de múltipla escolha para a lição.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: {
                                    type: Type.STRING,
                                    description: "A pergunta do quiz."
                                },
                                options: {
                                    type: Type.ARRAY,
                                    description: "Uma lista de 4 opções de resposta.",
                                    items: { type: Type.STRING }
                                },
                                correctAnswerIndex: {
                                    type: Type.INTEGER,
                                    description: "O índice (0-3) da resposta correta na lista de opções."
                                }
                            },
                            required: ["question", "options", "correctAnswerIndex"]
                        }
                    }
                },
                required: ["title", "content", "quiz"]
            }
        }
    },
    required: ["description", "lessons", "icon", "difficulty"]
};

export const generateCourse = async (topicTitle: string, difficulty: 'beginner' | 'intermediate' = 'beginner'): Promise<Omit<Course, 'id' | 'title'>> => {
  try {
    const prompt = `Gere um curso de educação financeira sobre "${topicTitle}" para o nível de dificuldade "${difficulty}". O curso deve ser completo, didático e em português do Brasil.
    
    Siga estritamente a estrutura JSON fornecida no schema.
    
    - Para o nível 'beginner', use linguagem muito simples, analogias do dia a dia e foque nos conceitos mais fundamentais. As perguntas do quiz devem ser diretas.
    - Para o nível 'intermediate', assuma que o usuário já conhece o básico. Introduza conceitos mais complexos, use terminologia técnica (com explicação) e apresente cenários mais elaborados. As perguntas do quiz podem exigir mais raciocínio.

    O curso deve ter:
    1. Uma 'description' curta e envolvente (2-3 sentenças).
    2. O 'icon' mais relevante para o tópico. Escolha um entre: 'tax', 'investment', ou 'budget'.
    3. O 'difficulty' correspondente ao solicitado ('beginner' ou 'intermediate').
    4. Uma lista de 3 'lessons'.
    
    Cada lição deve ter:
    1. Um 'title' claro e conciso.
    2. Um 'content' detalhado com pelo menos 3 parágrafos, explicando o tópico da lição. Use markdown para formatação (negrito, listas).
    3. Um 'quiz' com exatamente 3 perguntas de múltipla escolha.
    
    Cada questão do quiz deve ter:
    1. A 'question' em si.
    2. Uma lista de 4 'options'.
    3. O 'correctAnswerIndex' (de 0 a 3) indicando a resposta correta.
    
    O conteúdo deve ser prático e fácil de entender para o público-alvo.`;

    // Fix: Use gemini-2.5-flash for text generation with a JSON schema.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: courseSchema,
        },
    });

    // Fix: Extract text and parse it as JSON.
    const jsonText = response.text.trim();
    const courseData = JSON.parse(jsonText);

    // Basic validation to ensure the structure is correct
    if (!courseData.description || !Array.isArray(courseData.lessons) || !['tax', 'investment', 'budget'].includes(courseData.icon) || !['beginner', 'intermediate'].includes(courseData.difficulty)) {
        throw new Error("Invalid course structure received from API.");
    }

    return courseData;

  } catch (error) {
    console.error("Error generating course:", error);
    throw new Error(`Failed to generate course content for "${topicTitle}". Please try again.`);
  }
};


export const generateAvatar = async (prompt: string): Promise<string> => {
    try {
        // Fix: Use imagen-4.0-generate-001 for image generation.
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Um avatar fofo e estilizado para um app de finanças, representando: ${prompt}. Estilo de ícone de aplicativo, minimalista, fundo de cor sólida.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
            // Fix: Return the base64 encoded image string.
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating avatar:", error);
        throw new Error("Failed to generate avatar. Please check your prompt and try again.");
    }
};