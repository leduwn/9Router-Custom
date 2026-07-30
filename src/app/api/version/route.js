import https from "https";
import pkg from "../../../../package.json" with { type: "json" };

const NPM_PACKAGE_NAME = "9router";
const VERSION_CACHE_TTL_MS = 3600000; // cache npm latest lookup for 1h
const UI_BUILD_ID = process.env.NEXT_PUBLIC_DUWN_UI_BUILD_ID || pkg.version;

// Survive hot reload; one cache per process
const versionCache = (global.__npmVersionCache ??= { value: null, fetchedAt: 0 });

// Fetch latest version from npm registry
function fetchLatestVersion() {
  return new Promise((resolve) => {
    const req = https.get(
      `https://registry.npmjs.org/${NPM_PACKAGE_NAME}/latest`,
      { timeout: 4000 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data).version || null);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

async function getLatestVersionCached() {
  if (versionCache.value && Date.now() - versionCache.fetchedAt < VERSION_CACHE_TTL_MS) {
    return versionCache.value;
  }
  const latest = await fetchLatestVersion();
  if (latest) {
    versionCache.value = latest;
    versionCache.fetchedAt = Date.now();
  }
  return latest;
}

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
};

export async function GET(request) {
  const currentVersion = pkg.version;
  const requestUrl = new URL(request.url);
  const currentOnly = requestUrl.searchParams.get("currentOnly") === "1";
  if (currentOnly) {
    const legacyUiVersion = requestUrl.searchParams.get("ui");
    const clientBuildId = requestUrl.searchParams.get("build");
    // Older Duwn shells only sent the semver. Return a distinct version string
    // once so those clients reload even when both builds say v0.5.45.
    const syncVersion = legacyUiVersion && !clientBuildId
      ? `${currentVersion}-duwn.${UI_BUILD_ID}`
      : currentVersion;
    return Response.json(
      { currentVersion: syncVersion, uiBuildId: UI_BUILD_ID },
      { headers: NO_STORE_HEADERS },
    );
  }

  const latestVersion = await getLatestVersionCached();
  const hasUpdate = latestVersion ? compareVersions(latestVersion, currentVersion) > 0 : false;

  return Response.json(
    { currentVersion, uiBuildId: UI_BUILD_ID, latestVersion, hasUpdate },
    { headers: NO_STORE_HEADERS },
  );
}
