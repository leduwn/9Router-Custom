// Translator schema barrel — pure data enums (roles, blocks). No logic here.
export { ROLE, GEMINI_ROLE } from "./roles";
export {
  OPENAI_BLOCK, CLAUDE_BLOCK, RESPONSES_ITEM,
  VALID_OPENAI_CONTENT_TYPES, VALID_OPENAI_MESSAGE_TYPES,
} from "./blocks";
export { OPENAI_FINISH, CLAUDE_STOP, GEMINI_FINISH } from "./finishReasons";
export { MODEL_FALLBACK, DEFAULT_IMAGE_MIME } from "./defaults";
