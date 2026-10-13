export type Movie = {
  id: number; title: string; original_title?: string; overview: string;
  poster_path: string | null; backdrop_path?: string | null;
  release_date?: string; vote_average?: number; genre_ids?: number[];
  media_type?: string; original_language?: string;
};

export type CatalogInput = { query: string; genre: number; section: string; page: number };

export function catalogRequest(input: CatalogInput) {
  const params = new URLSearchParams({ language: "pt-BR", region: "BR", page: String(input.page) });
  if (input.query.trim()) {
    params.set("query", input.query.trim());
    return { path: "search/movie", params };
  }
  // Discovery supports genre constraints; movie/popular and now_playing do not.
  if (!input.genre && input.section === "Novidades") return { path: "movie/now_playing", params };
  if (!input.genre && input.section === "Mais populares") return { path: "movie/popular", params };
  params.set("sort_by", "popularity.desc");
  if (input.genre) params.set("with_genres", String(input.genre));
  if (input.section === "Marvel") params.set("with_companies", "420|19551");
  if (input.section === "Clássicos") {
    params.set("primary_release_date.lte", "1999-12-31");
    params.set("vote_count.gte", "50");
    params.set("sort_by", "primary_release_date.asc");
  }
  if (input.section === "Animação") params.set("with_genres", input.genre ? `16,${input.genre}` : "16");
  return { path: "discover/movie", params };
}