// Live star counts, fetched once and cached for a day.
//
// The unauthenticated GitHub API allows 60 requests an hour per IP, which one
// page load would exhaust. So this makes a single list request, caches the
// result in localStorage, and degrades to showing nothing at all if the call
// fails — stars are decoration, never a dependency of the page rendering.

const CACHE_KEY = 'gh-repos-v1';
const TTL_MS = 24 * 60 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, repos } = JSON.parse(raw);
    if (typeof at !== 'number' || Date.now() - at > TTL_MS) return null;
    return repos;
  } catch {
    return null;
  }
}

/**
 * Returns a map of repo name -> { stars, pushedAt }, or an empty map.
 * Never throws and never blocks first paint: callers render without it first.
 */
export async function loadRepoStats(user) {
  const cached = readCache();
  if (cached) return new Map(Object.entries(cached));

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`,
      { headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!res.ok) return new Map();

    const list = await res.json();
    if (!Array.isArray(list)) return new Map();

    const repos = {};
    for (const r of list) {
      if (r && typeof r.name === 'string') {
        repos[r.name] = { stars: r.stargazers_count ?? 0, pushedAt: r.pushed_at ?? null };
      }
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
    } catch {
      // Storage full or blocked — the page works without the cache.
    }
    return new Map(Object.entries(repos));
  } catch {
    return new Map();
  }
}
