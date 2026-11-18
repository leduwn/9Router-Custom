import { afterEach, expect, it, vi } from "vitest";
import { probeGeminiApiKey } from "../../open-sse/services/geminiApi.js";

const url = "https://generativelanguage.googleapis.com/v1beta/models";

afterEach(() => vi.restoreAllMocks());

it("validates against ListModels using an API key header and no credential in the URL", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ models: [] }));
  expect(await probeGeminiApiKey("offline-key", fetch)).toEqual({ valid: true, error: null });
  expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
    headers: { "x-goog-api-key": "offline-key" },
    signal: expect.any(AbortSignal),
  }));
});

it("explains API key restrictions without exposing the upstream error body", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({
    error: { message: "sensitive upstream details", details: [
      { "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason: "API_KEY_IP_ADDRESS_BLOCKED" },
    ] },
  }, { status: 403 }));
  const result = await probeGeminiApiKey("offline-key", fetch);
  expect(result.valid).toBe(false);
  expect(result.error).toMatch(/IP restriction/i);
  expect(result.error).not.toMatch(/sensitive|offline-key/);
});

it("does not report a Google rate limit as an invalid key", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("", { status: 429 }));
  expect(await probeGeminiApiKey("offline-key", fetch)).toMatchObject({ valid: false, error: expect.stringMatching(/quota|rate limit/i) });
});
