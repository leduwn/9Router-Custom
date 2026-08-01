// Image provider adapter registry
import createOpenAIAdapter from "./openai";
import gemini from "./gemini";
import codex from "./codex";
import sdwebui from "./sdwebui";
import comfyui from "./comfyui";
import huggingface from "./huggingface";
import nanobanana from "./nanobanana";
import falAi from "./falAi";
import stabilityAi from "./stabilityAi";
import blackForestLabs from "./blackForestLabs";
import runwayml from "./runwayml";
import cloudflareAi from "./cloudflareAi";
import antigravity from "./antigravity";

const ADAPTERS = {
  openai: createOpenAIAdapter("openai"),
  minimax: createOpenAIAdapter("minimax"),
  openrouter: createOpenAIAdapter("openrouter"),
  recraft: createOpenAIAdapter("recraft"),
  "vercel-ai-gateway": createOpenAIAdapter("vercel-ai-gateway"),
  xai: createOpenAIAdapter("xai"),
  gemini,
  codex,
  sdwebui,
  comfyui,
  huggingface,
  nanobanana,
  antigravity,
  "fal-ai": falAi,
  "stability-ai": stabilityAi,
  "black-forest-labs": blackForestLabs,
  runwayml,
  "cloudflare-ai": cloudflareAi,
};

export function getImageAdapter(provider) {
  return ADAPTERS[provider] || null;
}

export function isImageProvider(provider) {
  return provider in ADAPTERS;
}
