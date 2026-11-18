export const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const googleKeyErrors = {
  API_KEY_INVALID: "The Gemini API key is invalid.",
  API_KEY_SERVICE_BLOCKED: "This key is not allowed to call the Generative Language API.",
  API_KEY_IP_ADDRESS_BLOCKED: "The Gemini API key's IP restriction does not allow this server's egress IP.",
  API_KEY_HTTP_REFERRER_BLOCKED: "This Gemini API key has a website referrer restriction. Use a server key.",
  SERVICE_DISABLED: "Enable the Generative Language API on the Google Cloud project for this key.",
};

export async function probeGeminiApiKey(apiKey, fetchFn = fetch) {
  const response = await fetchFn(GEMINI_MODELS_URL, {
    headers: { "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.ok) return { valid: true, error: null };

  const body = await response.json().catch(() => null);
  const details = body?.error?.details;
  const reason = Array.isArray(details) && details.find(d => d?.["@type"] === "type.googleapis.com/google.rpc.ErrorInfo")?.reason;
  let error = Object.hasOwn(googleKeyErrors, reason) ? googleKeyErrors[reason] : null;
  if (!error) {
    if (response.status === 403) error = "Gemini API access denied (403). Check the project's API access and key restrictions.";
    else if (response.status === 429) error = "Gemini API rate limit or quota reached (429).";
    else error = `Gemini API key check failed (HTTP ${response.status}).`;
  }
  return { valid: false, error };
}
