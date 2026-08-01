// Eagerly import every translator so register() side-effects run under ESM/vitest.
// translator/index.js uses require() (bundler-only) which no-ops in vitest → import directly.
import "../../open-sse/translator/request/claude-to-openai";
import "../../open-sse/translator/request/openai-to-claude";
import "../../open-sse/translator/request/gemini-to-openai";
import "../../open-sse/translator/request/openai-to-gemini";
import "../../open-sse/translator/request/openai-to-vertex";
import "../../open-sse/translator/request/antigravity-to-openai";
import "../../open-sse/translator/request/openai-responses";
import "../../open-sse/translator/request/openai-to-kiro";
import "../../open-sse/translator/request/openai-to-cursor";
import "../../open-sse/translator/request/openai-to-ollama";
import "../../open-sse/translator/request/openai-to-commandcode";
import "../../open-sse/translator/request/claude-to-kiro";
import "../../open-sse/translator/response/claude-to-openai";
import "../../open-sse/translator/response/openai-to-claude";
import "../../open-sse/translator/response/gemini-to-openai";
import "../../open-sse/translator/response/openai-to-antigravity";
import "../../open-sse/translator/response/openai-responses";
import "../../open-sse/translator/response/kiro-to-openai";
import "../../open-sse/translator/response/cursor-to-openai";
import "../../open-sse/translator/response/ollama-to-openai";
import "../../open-sse/translator/response/commandcode-to-openai";
import "../../open-sse/translator/response/kiro-to-claude";
