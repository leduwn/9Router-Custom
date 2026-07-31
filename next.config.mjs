import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

function hashUiPath(hash, targetPath) {
  const stats = statSync(targetPath);
  if (stats.isDirectory()) {
    const entries = readdirSync(targetPath, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      hashUiPath(hash, join(targetPath, entry.name));
    }
    return;
  }

  hash.update(relative(projectRoot, targetPath).replaceAll("\\", "/"));
  hash.update(readFileSync(targetPath));
}

const uiHash = createHash("sha256");
for (const sourcePath of [
  "package.json",
  "public/favicon.svg",
  "public/icons",
  "public/sw.js",
  "src/app/(dashboard)",
  "src/app/globals.css",
  "src/app/landing",
  "src/app/login",
  "src/shared/components",
  "src/shared/constants/config.js",
  "src/shared/hooks",
]) {
  hashUiPath(uiHash, join(projectRoot, sourcePath));
}
const uiBuildId = uiHash.digest("hex").slice(0, 12);

// CLI bundling needs workspace root so tracing includes hoisted node_modules (slim ~50MB).
// Docker / default uses projectRoot so server.js lands at /app/server.js (not nested).
const tracingRoot = process.env.NEXT_TRACING_ROOT_MODE === "workspace"
  ? join(projectRoot, "..")
  : projectRoot;
const proxyClientMaxBodySize = process.env.NINEROUTER_PROXY_CLIENT_MAX_BODY_SIZE || "128mb";
const noStoreDocumentHeaders = [
  {
    key: "X-Duwn-UI-Build",
    value: uiBuildId
  },
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, max-age=0, must-revalidate"
  },
  {
    key: "Pragma",
    value: "no-cache"
  },
  {
    key: "Expires",
    value: "0"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "sql.js", "node:sqlite", "bun:sqlite"],
  turbopack: {
    root: tracingRoot
  },
  outputFileTracingRoot: tracingRoot,
  outputFileTracingExcludes: {
    "*": ["./gitbook/**/*"]
  },
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_DUWN_UI_BUILD_ID: uiBuildId,
  },
  experimental: {
    // #1529/#1572: LLM clients can send long context or base64 image payloads through /v1 rewrites.
    proxyClientMaxBodySize,
    // Cache fetch responses across HMR refreshes for faster dev reloads.
    serverComponentsHmrCache: true,
    // Tree-shake heavy barrel imports to cut compile + bundle size
    optimizePackageImports: ["@xyflow/react", "@dnd-kit/core", "@dnd-kit/sortable", "material-symbols", "marked"],
  },
  webpack: (config, { isServer }) => {
    // Ignore fs/path modules in browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    // Exclude non-source dirs from watcher to reduce inotify load
    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 300,
      ignored: /[\\/](node_modules|\.git|logs|\.next|\.next-cli-build|gitbook|cli|open-sse\.old|tests|docs)[\\/]/,
    };
    return config;
  },
  async headers() {
    return [
      { source: "/", headers: noStoreDocumentHeaders },
      { source: "/login", headers: noStoreDocumentHeaders },
      { source: "/landing", headers: noStoreDocumentHeaders },
      { source: "/dashboard/:path*", headers: noStoreDocumentHeaders },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, max-age=0, must-revalidate"
          },
          {
            key: "Service-Worker-Allowed",
            value: "/"
          }
        ]
      },
      {
        source: "/providers/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/v1/v1/:path*",
        destination: "/api/v1/:path*"
      },
      {
        source: "/v1/v1",
        destination: "/api/v1"
      },
      {
        source: "/codex/:path*",
        destination: "/api/v1/responses"
      },
      {
        source: "/responses",
        destination: "/api/v1/responses"
      },
      {
        source: "/v1beta/:path*",
        destination: "/api/v1beta/:path*"
      },
      {
        source: "/v1beta",
        destination: "/api/v1beta"
      },
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*"
      },
      {
        source: "/v1",
        destination: "/api/v1"
      }
    ];
  }
};

export default nextConfig;
