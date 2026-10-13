import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { catalogRequest, type Movie } from "./tmdb";

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({
    query: z.string().max(200), genre: z.number().int().min(0).max(11000),
    section: z.enum(["Em destaque", "Mais populares", "Novidades", "Clássicos", "Marvel", "Animação", "Minha lista"]),
    page: z.number().int().min(1).max(500),
  }).parse(input))
  .handler(async ({ data }): Promise<{ results: Movie[]; total_pages: number; total_results: number; error: string }> => {
    const empty = { results: [], total_pages: 1, total_results: 0 };
    const key = process.env['TMDB_API_KEY'];
    if (!key) return { ...empty, error: "A conexão com o catálogo ainda não foi configurada." };
    const { path, params } = catalogRequest(data);
    params.set("api_key", key);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/${path}?${params}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) {
        console.error("TMDB catalog status:", response.status);
        return { ...empty, error: response.status === 401 ? "A TMDB não aceitou a chave configurada." : "O catálogo está indisponível. Tente novamente em instantes." };
      }
      const payload = await response.json() as { results?: Movie[]; total_pages?: number; total_results?: number };
      if (!Array.isArray(payload.results)) return { ...empty, error: "Não foi possível carregar o catálogo." };
      return { results: payload.results, total_pages: Math.min(payload.total_pages || 1, 500), total_results: payload.total_results || 0, error: "" };
    } catch {
      return { ...empty, error: "Não foi possível conectar à TMDB. Tente novamente em instantes." };
    }
  });