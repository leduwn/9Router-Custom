import { DefaultExecutor } from "./default";
import { resolveXiaomiTokenplanBaseUrl } from "../config/providers";
// import { getModelTargetFormat } from "../config/providerModels";
// import { FORMATS } from "../translator/formats";

export class XiaomiTokenplanExecutor extends DefaultExecutor {
  constructor() {
    super("xiaomi-tokenplan");
  }

  // Token Plan keys are region-specific. Route per sourceFormat-matched transport:
  // claude → Anthropic /anthropic/v1/messages, openai → /chat/completions.
  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const baseUrl = resolveXiaomiTokenplanBaseUrl(credentials);
    if (credentials?.runtimeTransport?.format === "claude") {
      return `${baseUrl.replace(/\/v1\/?$/, "")}/anthropic/v1/messages`;
    }
    return `${baseUrl}/chat/completions`;
  }
}
