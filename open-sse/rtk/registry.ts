import { FILTERS } from "./constants";
import { gitDiff } from "./filters/gitDiff";
import { gitStatus } from "./filters/gitStatus";
import { gitLog } from "./filters/gitLog";
import { grep } from "./filters/grep";
import { find } from "./filters/find";
import { dedupLog } from "./filters/dedupLog";
import { ls } from "./filters/ls";
import { tree } from "./filters/tree";
import { smartTruncate } from "./filters/smartTruncate";
import { readNumbered } from "./filters/readNumbered";
import { searchList } from "./filters/searchList";

const REGISTRY = {
  [FILTERS.GIT_DIFF]: gitDiff,
  [FILTERS.GIT_STATUS]: gitStatus,
  [FILTERS.GIT_LOG]: gitLog,
  [FILTERS.GREP]: grep,
  [FILTERS.FIND]: find,
  [FILTERS.DEDUP_LOG]: dedupLog,
  [FILTERS.LS]: ls,
  [FILTERS.TREE]: tree,
  [FILTERS.SMART_TRUNCATE]: smartTruncate,
  [FILTERS.READ_NUMBERED]: readNumbered,
  [FILTERS.SEARCH_LIST]: searchList
};

// Rust resolve_filter aliases (pipe_cmd.rs): grep|rg, find|fd
const ALIASES = {
  rg: grep,
  fd: find
};

export function resolveFilter(name) {
  return REGISTRY[name] || ALIASES[name] || null;
}

export function allFilters() {
  return REGISTRY;
}
