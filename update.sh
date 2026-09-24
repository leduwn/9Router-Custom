#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly EXPECTED_REPO_DIR="/opt/9router"
readonly EXPECTED_DATA_DIR="/opt/9router/data"
readonly BRANCH="goc"
readonly ROUTER_CONTAINER="9router"
readonly HEADROOM_CONTAINER="headroom"

log() {
  printf '[9router-update] %s\n' "$*"
}

die() {
  printf '[9router-update] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

container_mount() {
  docker inspect "$1" --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Type}}|{{.Source}}|{{.RW}}{{end}}{{end}}'
}

container_label() {
  docker inspect "$1" --format "{{index .Config.Labels \"$2\"}}"
}

database_counts() {
  sqlite3 -readonly -separator '|' "$1" \
    "SELECT 'apiKeys', count(*) FROM apiKeys
     UNION ALL SELECT 'providerConnections', count(*) FROM providerConnections
     UNION ALL SELECT 'providerNodes', count(*) FROM providerNodes
     UNION ALL SELECT 'settings', count(*) FROM settings;"
}

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
[[ "$repo_dir" == "$EXPECTED_REPO_DIR" ]] || die "Run this tracked script from $EXPECTED_REPO_DIR (found $repo_dir)"
cd "$repo_dir"

require_command docker
require_command git
require_command sqlite3
require_command curl
require_command python3
require_command flock
docker compose version >/dev/null

[[ -f .env ]] || die "Missing $repo_dir/.env"
[[ -d data ]] || die "Missing $repo_dir/data"
[[ -s data/db/data.sqlite ]] || die "Database is missing or empty: $repo_dir/data/db/data.sqlite"

data_dir="$(readlink -f data)"
db_file="$(readlink -f data/db/data.sqlite)"
[[ "$data_dir" == "$EXPECTED_DATA_DIR" ]] || die "Unexpected data directory: $data_dir"
[[ "$db_file" == "$EXPECTED_DATA_DIR/db/data.sqlite" ]] || die "Unexpected database path: $db_file"

exec 9>"$data_dir/.update.lock"
flock -n 9 || die "Another 9Router update is already running"

docker inspect "$ROUTER_CONTAINER" >/dev/null 2>&1 || die "Container $ROUTER_CONTAINER does not exist"
current_mount="$(container_mount "$ROUTER_CONTAINER")"
[[ "$current_mount" == "bind|$EXPECTED_DATA_DIR|true" ]] || \
  die "Refusing update: $ROUTER_CONTAINER mount is '$current_mount', expected 'bind|$EXPECTED_DATA_DIR|true'"

router_project="$(container_label "$ROUTER_CONTAINER" com.docker.compose.project)"
router_service="$(container_label "$ROUTER_CONTAINER" com.docker.compose.service)"
router_working_dir="$(container_label "$ROUTER_CONTAINER" com.docker.compose.project.working_dir)"
[[ -n "$router_project" && "$router_service" == "9router" && "$router_working_dir" == "$repo_dir" ]] || \
  die "Container $ROUTER_CONTAINER is not managed by this Compose project; complete the one-time migration first"

docker inspect "$HEADROOM_CONTAINER" >/dev/null 2>&1 || die "Container $HEADROOM_CONTAINER does not exist"
[[ "$(docker inspect "$HEADROOM_CONTAINER" --format '{{.State.Running}}')" == "true" ]] || \
  die "Container $HEADROOM_CONTAINER is not running"
headroom_project="$(container_label "$HEADROOM_CONTAINER" com.docker.compose.project)"
headroom_service="$(container_label "$HEADROOM_CONTAINER" com.docker.compose.service)"
headroom_working_dir="$(container_label "$HEADROOM_CONTAINER" com.docker.compose.project.working_dir)"
[[ "$headroom_project" == "$router_project" && "$headroom_service" == "headroom" && "$headroom_working_dir" == "$repo_dir" ]] || \
  die "Container $HEADROOM_CONTAINER is not managed by this Compose project; complete the one-time migration first"

docker exec "$ROUTER_CONTAINER" getent hosts "$HEADROOM_CONTAINER" >/dev/null 2>&1 || \
  die "$ROUTER_CONTAINER cannot resolve $HEADROOM_CONTAINER on its Docker network"

integrity="$(sqlite3 -readonly "$db_file" 'PRAGMA integrity_check;')"
[[ "$integrity" == "ok" ]] || die "Source database integrity check failed: $integrity"

backup_dir="$data_dir/backups"
timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
backup_file="$backup_dir/data-$timestamp.sqlite"
backup_tmp="$backup_file.tmp"
compose_json=""
cleanup() {
  [[ -z "$backup_tmp" ]] || rm -f -- "$backup_tmp"
  [[ -z "$compose_json" ]] || rm -f -- "$compose_json"
}
trap cleanup EXIT
umask 077
mkdir -p "$backup_dir"
rm -f -- "$backup_tmp"

log "Creating online SQLite backup: $backup_file"
if ! sqlite3 -cmd '.timeout 10000' "$db_file" ".backup '$backup_tmp'"; then
  rm -f -- "$backup_tmp"
  die "SQLite .backup failed; source, image and containers were not changed"
fi

[[ -s "$backup_tmp" ]] || {
  rm -f -- "$backup_tmp"
  die "SQLite .backup produced an empty file; source, image and containers were not changed"
}
backup_integrity="$(sqlite3 -readonly "$backup_tmp" 'PRAGMA integrity_check;')"
[[ "$backup_integrity" == "ok" ]] || {
  rm -f -- "$backup_tmp"
  die "Backup integrity check failed: $backup_integrity"
}
mv -- "$backup_tmp" "$backup_file"
log "Backup verified: $backup_file"

before_counts="$(database_counts "$db_file")"
log "Database rows before update: $(printf '%s' "$before_counts" | tr '\n' ' ')"

[[ -d .git ]] || die "$repo_dir is not a Git repository"
origin_url="$(git remote get-url origin)"
case "$origin_url" in
  https://github.com/leduwn/9Router-Custom.git|git@github.com:leduwn/9Router-Custom.git)
    ;;
  *)
    die "Unexpected origin URL: $origin_url"
    ;;
esac
[[ -z "$(git status --porcelain)" ]] || die "Git working tree is not clean; backup is safe at $backup_file"

log "Fetching origin/$BRANCH"
git fetch origin "$BRANCH"
git switch "$BRANCH"
git merge --ff-only "origin/$BRANCH"

compose_json="$(mktemp)"
docker compose config --format json >"$compose_json"
python3 - "$compose_json" "$EXPECTED_DATA_DIR" <<'PY'
import json
import os
import sys

config_path, expected_data = sys.argv[1:]
with open(config_path, encoding="utf-8") as handle:
    config = json.load(handle)

services = config.get("services", {})
router = services.get("9router")
headroom = services.get("headroom")
if not router or not headroom:
    raise SystemExit("Compose must define both 9router and headroom services")

mounts = [item for item in router.get("volumes", []) if item.get("target") == "/app/data"]
if len(mounts) != 1:
    raise SystemExit("Compose must define exactly one /app/data mount")
mount = mounts[0]
source = os.path.realpath(mount.get("source", ""))
if mount.get("type") != "bind" or source != expected_data:
    raise SystemExit(f"Unsafe Compose data mount: type={mount.get('type')} source={source}")

environment = router.get("environment", {})
expected_environment = {
    "DATA_DIR": "/app/data",
    "PORT": "20128",
    "HOSTNAME": "0.0.0.0",
    "NODE_ENV": "production",
    "HEADROOM_URL": "http://headroom:8787",
}
for key, expected in expected_environment.items():
    actual = str(environment.get(key, ""))
    if actual != expected:
        raise SystemExit(f"Unexpected {key}: {actual!r}, expected {expected!r}")

if router.get("restart") != "always" or headroom.get("restart") != "always":
    raise SystemExit("Both services must keep restart: always")

router_ports = router.get("ports", [])
if not any(str(item.get("published")) == "20128" and int(item.get("target")) == 20128 for item in router_ports):
    raise SystemExit("Compose must publish 20128:20128")

router_networks = set(router.get("networks", {})) or {"default"}
headroom_networks = set(headroom.get("networks", {})) or {"default"}
if not router_networks.intersection(headroom_networks):
    raise SystemExit("9router and headroom must share a Compose network")

depends_on = router.get("depends_on", {})
if "headroom" not in depends_on:
    raise SystemExit("9router must depend on headroom")

print("Compose safety checks passed")
PY

log "Building custom image from local source"
docker compose build --pull 9router

log "Recreating only the Compose-managed 9router service"
docker compose up -d --no-deps --force-recreate --no-build 9router

post_mount="$(container_mount "$ROUTER_CONTAINER")"
[[ "$post_mount" == "bind|$EXPECTED_DATA_DIR|true" ]] || \
  die "Post-update mount mismatch: $post_mount"

healthy=false
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:20128/api/health | grep -Eq '"ok"[[:space:]]*:[[:space:]]*true'; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != "true" ]]; then
  docker compose logs --tail 100 9router >&2
  die "Health check failed; backup remains at $backup_file"
fi

post_integrity="$(sqlite3 -readonly "$db_file" 'PRAGMA integrity_check;')"
[[ "$post_integrity" == "ok" ]] || die "Post-update database integrity check failed: $post_integrity"
after_counts="$(database_counts "$db_file")"

python3 - "$before_counts" "$after_counts" <<'PY'
import sys

def parse(raw):
    result = {}
    for line in raw.splitlines():
        name, count = line.split("|", 1)
        result[name] = int(count)
    return result

before = parse(sys.argv[1])
after = parse(sys.argv[2])
lost = {name: (count, after.get(name, -1)) for name, count in before.items() if after.get(name, -1) < count}
if lost:
    raise SystemExit(f"Database row count decreased after update: {lost}")
print("Database row counts preserved:", after)
PY

docker compose ps
docker compose logs --tail 50 9router
log "Update completed successfully at commit $(git rev-parse --short HEAD)"
log "Verified backup: $backup_file"
