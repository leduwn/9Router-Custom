import { AntigravityExecutor } from "./antigravity";
import { AzureExecutor } from "./azure";
import { GeminiCLIExecutor } from "./gemini-cli";
import { GithubExecutor } from "./github";
import { IFlowExecutor } from "./iflow";
import { QoderExecutor } from "./qoder";
import { KiroExecutor } from "./kiro";
import { KimchiExecutor } from "./kimchi";
import { CodexExecutor } from "./codex";
import { CursorExecutor } from "./cursor";
import { VertexExecutor } from "./vertex";
import { QwenExecutor } from "./qwen";
import { OpenCodeExecutor } from "./opencode";
import { OpenCodeGoExecutor } from "./opencode-go";
import { GrokWebExecutor } from "./grok-web";
import { GrokCliExecutor } from "./grok-cli";
import { PerplexityWebExecutor } from "./perplexity-web";
import { OllamaLocalExecutor } from "./ollama-local";
import { CommandCodeExecutor } from "./commandcode";
import { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan";
import { MimoFreeExecutor } from "./mimo-free";
import { CodeBuddyExecutor } from "./codebuddy-cn";
import { CodeBuddyIntlExecutor } from "./codebuddy-intl";
import TraeExecutor from "./trae";
import ZedExecutor from "./zed";
import WindsurfExecutor from "./windsurf";
import { DefaultExecutor } from "./default";
import { DevinCliExecutor } from "./devin-cli";

const executors = {
  antigravity: new AntigravityExecutor(),
  azure: new AzureExecutor(),
  "gemini-cli": new GeminiCLIExecutor(),
  github: new GithubExecutor(),
  iflow: new IFlowExecutor(),
  qoder: new QoderExecutor(),
  kiro: new KiroExecutor(),
  kimchi: new KimchiExecutor(),
  codex: new CodexExecutor(),
  cursor: new CursorExecutor(),
  cu: new CursorExecutor(), // Alias for cursor
  vertex: new VertexExecutor("vertex"),
  "vertex-partner": new VertexExecutor("vertex-partner"),
  qwen: new QwenExecutor(),
  opencode: new OpenCodeExecutor(),
  "opencode-go": new OpenCodeGoExecutor(),
  "grok-web": new GrokWebExecutor(),
  "grok-cli": new GrokCliExecutor(),
  gcli: new GrokCliExecutor(), // Alias
  gb: new GrokCliExecutor(), // Alias (Grok Build)
  "perplexity-web": new PerplexityWebExecutor(),
  "ollama-local": new OllamaLocalExecutor(),
  commandcode: new CommandCodeExecutor(),
  "xiaomi-tokenplan": new XiaomiTokenplanExecutor(),
  "mimo-free": new MimoFreeExecutor(),
  mmf: new MimoFreeExecutor(), // Alias for mimo-free
  "codebuddy-cn": new CodeBuddyExecutor(),
  "codebuddy-intl": new CodeBuddyIntlExecutor(),
  trae: new TraeExecutor(),
  zed: new ZedExecutor(),
  windsurf: new WindsurfExecutor(),
  "devin-cli": new DevinCliExecutor(),
};

const defaultCache = new Map();

export function getExecutor(provider) {
  if (executors[provider]) return executors[provider];
  if (!defaultCache.has(provider)) defaultCache.set(provider, new DefaultExecutor(provider));
  return defaultCache.get(provider);
}

export function hasSpecializedExecutor(provider) {
  return !!executors[provider];
}

export { BaseExecutor } from "./base";
export { AntigravityExecutor } from "./antigravity";
export { AzureExecutor } from "./azure";
export { GeminiCLIExecutor } from "./gemini-cli";
export { GithubExecutor } from "./github";
export { IFlowExecutor } from "./iflow";
export { QoderExecutor } from "./qoder";
export { KiroExecutor } from "./kiro";
export { KimchiExecutor } from "./kimchi";
export { CodexExecutor } from "./codex";
export { CursorExecutor } from "./cursor";
export { VertexExecutor } from "./vertex";
export { DefaultExecutor } from "./default";
export { QwenExecutor } from "./qwen";
export { OpenCodeExecutor } from "./opencode";
export { OpenCodeGoExecutor } from "./opencode-go";
export { GrokWebExecutor } from "./grok-web";
export { GrokCliExecutor } from "./grok-cli";
export { PerplexityWebExecutor } from "./perplexity-web";
export { OllamaLocalExecutor } from "./ollama-local";
export { CommandCodeExecutor } from "./commandcode";
export { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan";
export { MimoFreeExecutor } from "./mimo-free";
export { CodeBuddyExecutor } from "./codebuddy-cn";
export { CodeBuddyIntlExecutor } from "./codebuddy-intl";
export { default as TraeExecutor } from "./trae";
export { default as ZedExecutor } from "./zed";
export { default as WindsurfExecutor } from "./windsurf";
export { DevinCliExecutor } from "./devin-cli";
