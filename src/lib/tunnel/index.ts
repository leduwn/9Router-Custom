// Cloudflare service
export {
  enableTunnel,
  disableTunnel,
  getTunnelStatus,
  isTunnelManuallyDisabled,
  isTunnelReconnecting,
  getTunnelService,
  setTunnelUnexpectedExitCallback,
} from "./cloudflare/manager";
export {
  killCloudflared,
  isCloudflaredRunning,
  ensureCloudflared,
  getDownloadStatus,
} from "./cloudflare/cloudflared";
export { probeUrlAlive as probeCloudflareAlive } from "./cloudflare/healthCheck";

// Tailscale service
export {
  enableTailscale,
  disableTailscale,
  getTailscaleStatus,
  isTailscaleReconnecting,
  getTailscaleService,
} from "./tailscale/manager";
export {
  isTailscaleInstalled,
  isTailscaleRunning,
  isTailscaleRunningStrict,
  isTailscaleLoggedIn,
  isTailscaleLoggedInStrict,
  isSystemDaemonRunning,
  isDaemonAlive,
  startFunnel,
  getTailscaleBin,
  installTailscale,
  startLogin,
  startDaemonWithPassword,
  TAILSCALE_SOCKET,
} from "./tailscale/tailscale";
export { probeUrlAlive as probeTailscaleAlive } from "./tailscale/healthCheck";

// Shared
export { loadState, generateShortId } from "./shared/state";
export { checkInternet } from "./shared/internetCheck";
export {
  RESTART_COOLDOWN_MS,
  NETWORK_SETTLE_MS,
  WATCHDOG_INTERVAL_MS,
  NETWORK_CHECK_INTERVAL_MS,
  VIRTUAL_IFACE_REGEX,
} from "./shared/watchdogConfig";
