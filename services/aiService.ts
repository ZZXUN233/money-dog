import { AIProvider } from "./aiProvider";
import { GeminiProvider } from "./geminiService";
import { DeepSeekProvider } from "./deepseekService";
import { Dream, DiaryEntry } from "../types";

const providerName = process.env.AI_PROVIDER || "gemini";

function createProvider(): AIProvider {
  switch (providerName) {
    case "deepseek":
      return new DeepSeekProvider();
    case "gemini":
    default:
      return new GeminiProvider();
  }
}

const provider = createProvider();

export const initializeChat = (dreams: Dream[], diaryEntries: DiaryEntry[]): boolean =>
  provider.initializeChat(dreams, diaryEntries);

export const sendMessageToMoney = (message: string): Promise<string> =>
  provider.sendMessageToMoney(message);

export const generateDiaryComment = (diaryContent: string): Promise<string> =>
  provider.generateDiaryComment(diaryContent);
