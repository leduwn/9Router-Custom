import { afterEach, expect, it, vi } from "vitest";
import { keepClaudeStreamAlive } from "../../src/sse/services/claudeStream.js";

const ping = 'event: ping\ndata: {"type":"ping"}\n\n';
const stop = 'event: message_stop\ndata: {"type":"message_stop"}\n\n';
const decode = new TextDecoder();
const sse = (body) => new Response(body, { headers: { "Content-Type": "text/event-stream" } });
const tick = () => vi.advanceTimersByTimeAsync(15_000);

afterEach(() => vi.useRealTimers());

it("preserves an early HTTP error with its headers", async () => {
  const failure = Response.json({}, { status: 429, headers: { "retry-after": "10" } });
  expect(await keepClaudeStreamAlive(async () => failure)).toBe(failure);
});

it("sends pings before provider headers arrive and forwards the Claude stream intact", async () => {
  vi.useFakeTimers();
  const upstream = Promise.withResolvers();
  const response = keepClaudeStreamAlive(() => upstream.promise);
  await tick();
  const downstream = await response;
  expect(downstream.headers.get("x-accel-buffering")).toBe("no");
  expect(downstream.headers.get("cache-control")).toContain("no-transform");
  const reader = downstream.body.getReader();
  expect(decode.decode((await reader.read()).value)).toBe(ping);
  // Hold provider headers beyond the Cloudflare threshold in the reported 524.
  for (let i = 0; i < 8; i++) {
    const waiting = reader.read();
    await tick();
    expect(decode.decode((await waiting).value)).toBe(ping);
  }
  upstream.resolve(sse(stop));
  expect(decode.decode((await reader.read()).value)).toBe(stop);
  expect((await reader.read()).done).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("pings when provider headers arrive but the first bytes have not", async () => {
  vi.useFakeTimers();
  let origin;
  const upstream = sse(new ReadableStream({ start(c) { origin = c; } }));
  upstream.headers.set("request-id", "req-123");
  const response = await keepClaudeStreamAlive(async () => upstream);
  expect(response.headers.get("request-id")).toBe("req-123");
  const reader = response.body.getReader();
  const first = reader.read();
  await tick();
  expect(decode.decode((await first).value)).toBe(ping);
  origin.enqueue(new TextEncoder().encode("event: message_"));
  expect(decode.decode((await reader.read()).value)).toBe("event: message_");
  const rest = reader.read();
  await tick();
  origin.enqueue(new TextEncoder().encode("stop\n\n"));
  expect(decode.decode((await rest).value)).toBe("stop\n\n");
  origin.close();
  expect((await reader.read()).done).toBe(true);
});

it("sends a Claude error event if the HTTP response arrives after the first ping", async () => {
  vi.useFakeTimers();
  const upstream = Promise.withResolvers();
  const pending = keepClaudeStreamAlive(() => upstream.promise);
  await tick();
  const response = await pending;
  upstream.resolve(Response.json({ error: { message: "Try again" } }, { status: 429 }));
  const result = await response.text();
  expect(result).toContain(ping);
  expect(result).toContain('event: error\ndata: {"type":"error","error":{"type":"rate_limit_error","message":"Try again"}}');
  expect(vi.getTimerCount()).toBe(0);
});

it("aborts a provider still waiting on headers when the client cancels", async () => {
  vi.useFakeTimers();
  let signal;
  const pending = keepClaudeStreamAlive((value) => {
    signal = value;
    return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason)));
  });
  await tick();
  await (await pending).body.cancel("client closed");
  expect(signal.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("closes the downstream and clears the ping when the HTTP request aborts", async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  const pending = keepClaudeStreamAlive((signal) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason));
  }), controller.signal);
  await tick();
  const reader = (await pending).body.getReader();
  expect(decode.decode((await reader.read()).value)).toBe(ping);
  const end = reader.read();
  controller.abort();
  expect((await end).done).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
