import OpenAI from "openai";
import { Dream, DiaryEntry } from "../types";
import { AIProvider, SYSTEM_INSTRUCTION, buildContext } from "./aiProvider";

export class DeepSeekProvider implements AIProvider {
  private client: OpenAI;
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
      dangerouslyAllowBrowser: true,
    });
  }

  initializeChat(dreams: Dream[], diaryEntries: DiaryEntry[]): boolean {
    try {
      const context = buildContext(dreams, diaryEntries);
      this.messages = [
        { role: "system", content: SYSTEM_INSTRUCTION + `\n当前上下文信息：\n${context}` },
        { role: "user", content: "钱钱，你好！我来了。" },
        { role: "assistant", content: "你好呀！我是钱钱。很高兴见到你！我们要一起为了梦想努力哦，汪！你想先聊聊你的梦想，还是记录今天的成功日记呢？" },
      ];
      return true;
    } catch (error) {
      console.error("Failed to initialize DeepSeek chat:", error);
      return false;
    }
  }

  async sendMessageToMoney(message: string): Promise<string> {
    if (this.messages.length === 0) {
      this.initializeChat([], []);
    }

    try {
      this.messages.push({ role: "user", content: message });
      const completion = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: this.messages,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || "汪？我没听清...";
      this.messages.push({ role: "assistant", content: text });
      return text;
    } catch (error) {
      console.error("DeepSeek send message error:", error);
      return "汪呜... 我现在有点累，稍后再聊吧。";
    }
  }

  async generateDiaryComment(diaryContent: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: `用户写了一条成功日记："${diaryContent}"。作为小狗钱钱，请用一句温暖鼓励的话评价它，并以"汪！"结尾。` },
        ],
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content || "太棒了！汪！";
    } catch (error) {
      console.error("DeepSeek diary comment error:", error);
      return "做得真棒！汪！";
    }
  }
}
