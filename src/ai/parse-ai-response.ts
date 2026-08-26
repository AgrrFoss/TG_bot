import { AiAction } from './ai-actions';
export interface ParsedAiResponse {
  text: string; // чистый текст для клиента
  action: AiAction; // какое действие нужно выполнить
}
const MARKER_TO_ACTION: Record<string, AiAction> = {
  NEED_MANAGER: AiAction.NEED_MANAGER,
  NEW_APPLICATION: AiAction.NEW_APPLICATION,
  NONE: AiAction.NONE,
};
const ACTION_REGEX = /\[ACTION:(NEED_MANAGER|NEW_APPLICATION|NONE)\]/gi;
export function parseAiResponse(raw: string): ParsedAiResponse {
  let action: AiAction = AiAction.NONE;
  const text = raw
    .replace(ACTION_REGEX, (_match, actionName: string) => {
      const upper = actionName.toUpperCase();
      action = MARKER_TO_ACTION[upper] ?? AiAction.NONE;
      return ''; // убираем маркер из текста
    })
    .trim();
  return {
    text,
    action,
  };
}
