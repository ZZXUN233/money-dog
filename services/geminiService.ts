import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Dream, DiaryEntry } from "../types";
import { AIProvider, SYSTEM_INSTRUCTION, buildContext } from "./aiProvider";

export class GeminiProvider implements AIProvider {
  private chatSession: Chat | null = null;

  initializeChat(dreams: Dream[], diaryEntries: DiaryEntry[]): boolean {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = buildContext(dreams, diaryEntries);

      const initialHistory = [
        {
          role: "user",
          parts: [{ text: "钱钱，你好！我来了。" }],
        },
        {
          role: "model",
          parts: [{ text: "你好呀！我是钱钱。很高兴见到你！我们要一起为了梦想努力哦，汪！你想先聊聊你的梦想，还是记录今天的成功日记呢？" }],
        },
      ];

      this.chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + `\n当前上下文信息：\n${context}`,
          temperature: 0.7,
        },
        history: initialHistory,
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize Gemini chat:", error);
      return false;
    }
  }

  async sendMessageToMoney(message: string): Promise<string> {
    if (!this.chatSession) {
      this.initializeChat([], []);
    }

    if (!this.chatSession) {
      return "汪呜... 我好像有点晕（连接失败）。";
    }

    try {
      const result: GenerateContentResponse = await this.chatSession.sendMessage({ message });
      return result.text || "汪？我没听清...";
    } catch (error) {
      console.error("Gemini send message error:", error);
      return "汪呜... 我现在有点累，稍后再聊吧。";
    }
  }

  async generateDiaryComment(diaryContent: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `用户写了一条成功日记："${diaryContent}"。作为小狗钱钱，请用一句温暖鼓励的话评价它，并以"汪！"结尾。`,
      });
      return response.text || "太棒了！汪！";
    } catch (error) {
      return "做得真棒！汪！";
    }
  }
}
