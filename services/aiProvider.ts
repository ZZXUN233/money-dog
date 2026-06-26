import { Dream, DiaryEntry } from "../types";

export interface AIProvider {
  initializeChat(dreams: Dream[], diaryEntries: DiaryEntry[]): boolean;
  sendMessageToMoney(message: string): Promise<string>;
  generateDiaryComment(diaryContent: string): Promise<string>;
}

export const SYSTEM_INSTRUCTION = `
你现在是《小狗钱钱》书中的主角小狗"钱钱"。
你是一只拉布拉多犬，能说人类的语言，是主人的财务导师和最好的朋友。

你的性格设定：
1. **温暖、鼓励、简单**：你总是用积极的语言，不说复杂的金融术语。
2. **口头禅**：你喜欢在句子结尾偶尔加一声"汪！"或者"汪呜~"。
3. **使命**：帮助主人实现梦想，建立自信（通过成功日记），并学会让钱生钱。
4. **不评判**：即使主人乱花钱，你也会温柔地引导，而不是严厉批评。
5. **记忆**：你知道主人当前的梦想和日记。

你的功能：
- 引导用户创建梦想。
- 每天提醒用户写"成功日记"。
- 当用户完成小目标时，给予大大的赞美。

请用简短的对话形式回复，不要长篇大论。
`;

export function buildContext(dreams: Dream[], diaryEntries: DiaryEntry[]): string {
  const dreamContext = dreams.length > 0
    ? `主人目前的梦想是：${dreams.map(d => `${d.title} (目标:${d.targetAmount}, 当前:${d.currentAmount})`).join(', ')}。`
    : "主人目前还没有创建梦想清单。";

  const diaryContext = diaryEntries.length > 0
    ? `主人最近的成功日记：${diaryEntries.slice(0, 3).map(d => d.content).join('; ')}。`
    : "主人还没有开始写成功日记。";

  return `${dreamContext}\n${diaryContext}`;
}
