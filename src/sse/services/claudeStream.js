const PING_MS = 15_000;
const encoder = new TextEncoder();
const ping = encoder.encode('event: ping\ndata: {"type":"ping"}\n\n');
const isSse = (response) => response?.ok && response.body &&
  response.headers.get("content-type")?.startsWith("text/event-stream");

async function errorEvent(response) {
  const status = response?.status;
  const type = {
    400: "invalid_request_error", 401: "authentication_error",
    403: "permission_error", 404: "not_found_error",
    429: "rate_limit_error", 529: "overloaded_error",
  }[status] || "api_error";
  const body = await response?.json().catch(() => null);
  const message = typeof body?.error?.message === "string"
    ? body.error.message
    : status && !response.ok ? `Upstream returned HTTP ${status}` : "Upstream did not return a Claude stream";
  return encoder.encode(`event: error\ndata: ${JSON.stringify({ type: "error", error: { type, message } })}\n\n`);
}

export async function keepClaudeStreamAlive(dispatch, requestSignal) {
  const cancel = new AbortController();
  const signal = requestSignal ? AbortSignal.any([requestSignal, cancel.signal]) : cancel.signal;
  const pending = dispatch(signal);
  let deadline;
  const first = await Promise.race([
    pending,
    new Promise((resolve) => { deadline = setTimeout(resolve, PING_MS); }),
  ]).finally(() => clearTimeout(deadline));

  // Preserve status, Retry-After and the original body when an error arrives early.
  if (first && !isSse(first)) return first;
  const headers = new Headers(first?.headers);
  headers.delete("content-length");
  headers.set("content-type", "text/event-stream");
  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", "no-cache, no-transform");
  headers.set("x-accel-buffering", "no");

  let reader;
  let timer;
  let abort;
  let relayed = false;
  const cleanup = () => {
    clearInterval(timer);
    requestSignal?.removeEventListener("abort", abort);
  };
  const body = new ReadableStream({
    start(controller) {
      const sendPing = () => {
        if (!signal.aborted && controller.desiredSize > 0) controller.enqueue(ping);
      };
      abort = () => {
        cleanup();
        controller.close();
        reader?.cancel(requestSignal.reason).catch(() => {});
      };
      if (requestSignal?.aborted) {
        abort();
        pending.then((response) => response.body?.cancel()).catch(() => {});
        return;
      }
      requestSignal?.addEventListener("abort", abort, { once: true });
      if (!first) sendPing();
      timer = setInterval(sendPing, PING_MS);
    },
    async pull(controller) {
      try {
        if (!reader) {
          const response = first || await pending;
          if (signal.aborted) {
            await response.body?.cancel();
            return;
          }
          if (!isSse(response)) {
            const event = await errorEvent(response);
            if (!signal.aborted) controller.enqueue(event);
            if (!signal.aborted) controller.close();
            cleanup();
            return;
          }
          reader = response.body.getReader();
        }
        const { done, value } = await reader.read();
        if (signal.aborted) return;
        if (done) {
          cleanup();
          controller.close();
        } else {
          relayed = true;
          controller.enqueue(value);
        }
      } catch (error) {
        if (signal.aborted) return;
        // Upstream may have split an event across chunks; never inject into it.
        if (relayed) {
          controller.error(error);
        } else {
          const event = await errorEvent();
          if (!signal.aborted) {
            controller.enqueue(event);
            controller.close();
          }
        }
        cleanup();
      } finally {
        clearInterval(timer);
      }
    },
    cancel(reason) {
      cleanup();
      cancel.abort(reason);
      return reader?.cancel(reason);
    },
  });
  return new Response(body, { status: first?.status ?? 200, headers });
}
