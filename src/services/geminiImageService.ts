import { GoogleGenAI, Modality } from '@google/genai';

const MODEL = 'gemini-2.0-flash-preview-image-generation';

class GeminiImageService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async generateImage(prompt: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseModalities: [Modality.IMAGE] },
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data && part.inlineData?.mimeType) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image in Gemini response');
  }

  async generateImagesForPages(prompts: string[]): Promise<(string | null)[]> {
    // Sequential to avoid rate limits on free tier
    const results: (string | null)[] = [];
    for (const prompt of prompts) {
      try {
        results.push(await this.generateImage(prompt));
      } catch (err) {
        console.error('Gemini image generation failed:', err);
        results.push(null); // fallback to picsum
      }
    }
    return results;
  }
}

export const geminiImageService = new GeminiImageService();
