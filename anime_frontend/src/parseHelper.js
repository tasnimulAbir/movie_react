export const JIKAN_BASE = 'https://api.jikan.moe/v4';
export const jikanUrl = (path, params = {}) => {
  const qs = new URLSearchParams(params);
  return `${JIKAN_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ''}`;
};


export const mapJikanAnime = (a) => ({
  id: a.mal_id,
  title: a.title || a.title_english || a.title_japanese,
  image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || '',
  episodes: a.episodes ?? null,
  startDate: a.aired?.from ?? null,
  score: a.score ?? null,
});


const TOP_ANIME_LIMIT = 24;
export const buildEndpoint = (q) => {
  const trimmed = (q || '').trim();
  if (trimmed.length > 0) {
    return jikanUrl('/anime', {
      q: trimmed,
      page: 1,
      limit: TOP_ANIME_LIMIT,
      order_by: 'members',
      sort: 'desc',
      sfw: true,
    });
  }
  return jikanUrl('/top/anime', { page: 1, limit: TOP_ANIME_LIMIT });
};


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
export const sendMetric = async (query, anime) => {
  try {
    if (!query) return;
    const payload = {
      searchTerm: query.trim(),
      anime_id: Number.parseInt(anime?.id ?? 0, 10) || 0,
      poster_url: anime?.image || `/no-anime.png`,
    };
    await fetch(`${API_BASE}/metrics/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('metric send failed:', e);
  }
};

export const getTrendingAnimes = async () => {
  try {
    const res = await fetch(`${API_BASE}/metrics/top`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to load trending: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const rows = json?.data ?? [];

    const mapped = rows.map((r) => ({
      id: r.anime_id ?? r.search_term,       
      title: r.search_term,                
      image: r.poster_url || '/no-anime.png',
      count: r.count ?? 0,
    }));
    console.log('getTrendingAnimes mapped:', mapped);
    return mapped;
  } catch (err) {
    console.error('getTrendingAnimes failed:', err);
    return [];
  }
};