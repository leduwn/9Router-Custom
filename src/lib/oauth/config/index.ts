/**
 * Credentials used by the legacy standalone OAuth service classes.
 * Modern dashboard OAuth routes do not use this module.
 */
export function getServerCredentials() {
  return {
    server: process.env.NINE_ROUTER_SERVER_URL || "http://localhost:20128",
    token: process.env.NINE_ROUTER_SERVER_TOKEN || "",
    userId: process.env.NINE_ROUTER_USER_ID || "",
  };
}
