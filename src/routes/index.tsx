import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow, Bookmark, Check, ChevronDown, Clapperboard, Film,
  Heart, Info, Menu, Play, Search, Sparkles, Star, X
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

type Movie = {
  id: number; title: string; original_title?: string; overview: string;
  poster_path: string | null; backdrop_path?: string | null;
  release_date?: string; vote_average?: number; genre_ids?: number[];
  media_type?: string; original_language?: string;
};

const image = (path: string | null | undefined, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

const demoMovies: Movie[] = [
  { id: 1, title: "Interestelar", overview: "Uma equipe de exploradores viaja além desta galáxia para descobrir se a humanidade tem futuro entre as estrelas.", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/rAiYTfKGqDCRIIqo664sY9XYIvQ.jpg", release_date: "2014-11-05", vote_average: 8.7, genre_ids: [18, 878] },
  { id: 2, title: "Duna: Parte Dois", overview: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.", poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", release_date: "2024-02-27", vote_average: 8.2, genre_ids: [878, 12] },
  { id: 3, title: "O Batman", overview: "Em seu segundo ano combatendo o crime, Batman investiga uma série de assassinatos que revela a corrupção de Gotham.", poster_path: "/wd7NcMifnuf66gD2Fm7i5u6W6W.jpg", backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg", release_date: "2022-03-01", vote_average: 7.7, genre_ids: [80, 9648] },
  { id: 4, title: "Homem-Aranha: Através do Aranhaverso", overview: "Miles Morales atravessa o multiverso e encontra uma equipe de heróis encarregada de proteger sua existência.", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", release_date: "2023-05-31", vote_average: 8.4, genre_ids: [16, 28, 12] },
  { id: 5, title: "O Poderoso Chefão", overview: "O patriarca de uma família mafiosa transfere gradualmente o controle de seu império para o filho mais novo.", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", release_date: "1972-03-14", vote_average: 8.7, genre_ids: [18, 80] },
  { id: 6, title: "A Origem", overview: "Um especialista em invadir sonhos recebe uma missão quase impossível: implantar uma ideia na mente de alguém.", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", release_date: "2010-07-15", vote_average: 8.4, genre_ids: [28, 878, 12] },
  { id: 7, title: "Parasita", overview: "Uma família com dificuldades financeiras se infiltra na vida de uma família rica, com consequências inesperadas.", poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop_path: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg", release_date: "2019-05-30", vote_average: 8.5, genre_ids: [35, 53, 18] },
  { id: 8, title: "Toy Story", overview: "Os brinquedos de Andy ganham vida quando ninguém está olhando e vivem aventuras longe do quarto.", poster_path: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", backdrop_path: "/dji4Fm0gCDVb9DQQMRvAI8YNnTz.jpg", release_date: "1995-11-22", vote_average: 8.0, genre_ids: [16, 12, 35] },
  { id: 9, title: "Cidade de Deus", overview: "Dois jovens seguem caminhos diferentes em uma comunidade do Rio de Janeiro marcada pela violência e pela fotografia.", poster_path: "/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg", backdrop_path: "/jQNOzoia0suNOarERMbqORwDqNN.jpg", release_date: "2002-08-30", vote_average: 8.4, genre_ids: [18, 80] },
  { id: 10, title: "De Volta para o Futuro", overview: "Um adolescente viaja acidentalmente ao passado e precisa garantir que seus pais se conheçam para poder voltar ao futuro.", poster_path: "/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg", backdrop_path: "/7lyBcpYB0Qt8gYhXYaEZUNlNQAv.jpg", release_date: "1985-07-03", vote_average: 8.3, genre_ids: [12, 35, 878] },
  { id: 11, title: "Top Gun: Maverick", overview: "Depois de décadas de serviço, Maverick treina uma nova geração de pilotos para uma missão especial.", poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", backdrop_path: "/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg", release_date: "2022-05-24", vote_average: 8.2, genre_ids: [28, 18] },
  { id: 12, title: "A Viagem de Chihiro", overview: "Uma menina entra em um mundo mágico de espíritos e precisa encontrar coragem para salvar seus pais.", poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", backdrop_path: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg", release_date: "2001-07-20", vote_average: 8.5, genre_ids: [16, 10751, 14] },
];
const genres = [
  { label: "Todos", id: 0 }, { label: "Ação", id: 28 }, { label: "Aventura", id: 12 },
  { label: "Animação", id: 16 }, { label: "Comédia", id: 35 }, { label: "Crime", id: 80 },
  { label: "Documentário", id: 99 }, { label: "Drama", id: 18 }, { label: "Fantasia", id: 14 },
  { label: "Ficção científica", id: 878 }, { label: "Mistério", id: 9648 },
  { label: "Romance", id: 10749 }, { label: "Suspense", id: 53 }, { label: "Terror", id: 27 }, { label: "Família", id: 10751 }, { label: "Guerra", id: 10752 }, { label: "Música", id: 10402 }, { label: "História", id: 36 }, { label: "Faroeste", id: 37 }, { label: "Família", id: 10751 }, { label: "Guerra", id: 10752 }, { label: "Música", id: 10402 }, { label: "História", id: 36 }, { label: "Faroeste", id: 37 },
];
const year = (m: Movie) => m.release_date?.slice(0, 4) || "—";

function Index() {
  const [movies, setMovies] = useState<Movie[]>(demoMovies);
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(0);
  const [section, setSection] = useState("Em destaque");
  const [selected, setSelected] = useState<Movie | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(12);
  const [apiError, setApiError] = useState("");
  const [apiStatus, setApiStatus] = useState<"demo" | "live">("demo");
  const apiKey = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_TMDB_API_KEY;

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("cineverse-watchlist") || "[]")); } catch { setSaved([]); }
  }, []);
  useEffect(() => {
    localStorage.setItem("cineverse-watchlist", JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ api_key: apiKey, language: "pt-BR", region: "BR", page: String(page) });
    if (activeGenre && !query.trim()) params.set("with_genres", String(activeGenre));
    const endpoint = query.trim()
      ? `https://api.themoviedb.org/3/search/movie?${params}&query=${encodeURIComponent(query.trim())}`
      : section === "Novidades"
        ? `https://api.themoviedb.org/3/movie/now_playing?${params}`
        : section === "Mais populares"
          ? `https://api.themoviedb.org/3/movie/popular?${params}`
          : section === "Novidades"
            ? `https://api.themoviedb.org/3/movie/now_playing?${params}`
            : `https://api.themoviedb.org/3/discover/movie?${params}&sort_by=popularity.desc${section === "Marvel" ? "&with_companies=420%7C19551" : section === "Clássicos" ? "&primary_release_date.lte=1999-12-31&vote_count.gte=50&sort_by=primary_release_date.asc" : section === "Animação" ? "&with_genres=16" : ""}`;
    fetch(endpoint).then(r => { if (!r.ok) throw new Error("Não foi possível carregar o catálogo"); return r.json(); })
      .then(data => { if (!cancelled && Array.isArray(data.results)) { setMovies(old => page === 1 ? data.results : [...old, ...data.results.filter((m: Movie) => !old.some(x => x.id === m.id))]); setTotalPages(Math.min(Number(data.total_pages || 1), 500)); setTotalResults(Number(data.total_results || data.results.length)); setApiError(""); setApiStatus("live"); } })
      .catch((err) => { if (!cancelled) { setApiStatus("demo"); setApiError(err instanceof Error ? err.message : "Erro ao consultar a TMDB."); if (page === 1) { if (query.trim()) setMovies(demoMovies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()))); else setMovies(demoMovies); } } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [apiKey, query, activeGenre, section, page]);

  const visibleMovies = useMemo(() => movies.filter(m =>
    (!activeGenre || m.genre_ids?.includes(activeGenre)) &&
    (!query.trim() || apiStatus === "live" || m.title.toLowerCase().includes(query.toLowerCase()))
  ), [movies, activeGenre, query, apiStatus]);
  const featured = movies.find(m => m.backdrop_path) || demoMovies[0];
  const toggleSaved = (id: number) => setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const savedMovies = [...demoMovies, ...movies].filter((m, i, arr) => saved.includes(m.id) && arr.findIndex(x => x.id === m.id) === i);

  return (
    <main className="cine-app">
      <header className="topbar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setSection("Em destaque"); setQuery(""); setActiveGenre(0); }}>
          <span className="brand-icon"><Clapperboard size={21} /></span><span>CINE<span className="brand-accent">VERSE</span></span>
        </a>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
          {["Início", "Filmes", "Novidades", "Clássicos", "Marvel", "Animação", "Minha lista"].map(item =>
            <button key={item} className={section === item || (item === "Início" && section === "Em destaque") ? "nav-link active" : "nav-link"}
              onClick={() => { setSection(item === "Início" ? "Em destaque" : item === "Filmes" ? "Mais populares" : item); setQuery(""); setPage(1); setActiveGenre(0); setMenuOpen(false); }}>
              {item}
            </button>
          )}
        </nav>
        <div className="header-actions">
          <label className="search-box"><Search size={17} /><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar filmes..." aria-label="Buscar filmes" />{query && <button onClick={() => { setQuery(""); setPage(1); }} aria-label="Limpar busca"><X size={15} /></button>}</label>
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu"><Menu /></button>
        </div>
      </header>

      {section !== "Minha lista" && !query && (
        <section className="hero" style={{ backgroundImage: featured.backdrop_path ? `linear-gradient(90deg, #090b12 0%, rgba(9,11,18,.91) 28%, rgba(9,11,18,.45) 66%, rgba(9,11,18,.18) 100%), linear-gradient(0deg, #090b12 0%, transparent 40%), url(${image(featured.backdrop_path, "original")})` : undefined }}>
          <div className="hero-content">
            <div className="eyebrow"><Sparkles size={14} /> SEU PRÓXIMO FILME FAVORITO</div>
            <h1>Grandes histórias.<br /><span>Uma só tela.</span></h1>
            <p className="hero-copy">Explore clássicos inesquecíveis, lançamentos e joias escondidas do cinema. Sua próxima aventura começa aqui.</p>
            <div className="hero-meta"><span className="rating"><Star size={15} fill="currentColor" /> {(featured.vote_average || 8.7).toFixed(1)}</span><span>{year(featured)}</span><span className="meta-pill">Filmes e cinema</span></div>
            <div className="hero-buttons"><button className="btn-primary" onClick={() => setSelected(featured)}><Info size={17} /> Ver detalhes</button><button className="btn-secondary" onClick={() => toggleSaved(featured.id)}><Bookmark size={17} /> {saved.includes(featured.id) ? "Na minha lista" : "Minha lista"}</button></div>
          </div>
          <div className="hero-bottom"><span><span className="live-dot" /> CATÁLOGO DE CINEMA</span><span>Descubra algo extraordinário</span></div>
        </section>
      )}

      <section className="catalog-section">
        <div className="section-heading">
          <div><p className="section-kicker">{section === "Minha lista" ? "GUARDADOS POR VOCÊ" : query ? "RESULTADOS DA BUSCA" : "ESCOLHIDOS PARA VOCÊ"}</p>
            <h2>{section === "Minha lista" ? "Minha lista" : query ? `Buscar: “${query}”` : section === "Novidades" ? "Em cartaz e novidades"  : section === "Clássicos" ? "Clássicos que marcaram época" : section === "Marvel" ? "Universo Marvel e super-heróis" : section === "Animação" ? "Animações e desenhos" : section === "Mais populares" ? "Filmes populares" : "Explore o catálogo"}</h2>
          </div>
          <div className="catalog-status"><span className={apiStatus === "live" ? "status-dot live" : "status-dot"} />{apiStatus === "live" ? "TMDB conectada" : "Modo demonstração"}</div>
        </div>

        {section !== "Minha lista" && <div className="genre-strip"><span className="genre-label"><ArrowDownWideNarrow size={15} /> GÊNEROS</span>{genres.map(g => <button key={g.id} onClick={() => { setActiveGenre(g.id); setPage(1); }} className={activeGenre === g.id ? "genre-chip selected" : "genre-chip"}>{g.label}</button>)}</div>}

        {apiError && <p className="api-alert" role="status">{apiError} Confira se VITE_TMDB_API_KEY está configurada no projeto Lovable.</p>}
        {loading && <div className="loading-line"><span /> {page > 1 ? "Carregando mais filmes..." : "Atualizando catálogo..."}</div>}
        {section === "Minha lista" ? (
          savedMovies.length ? <div className="movie-grid">{savedMovies.map(m => <MovieCard key={m.id} movie={m} saved={saved.includes(m.id)} onOpen={() => setSelected(m)} onSave={() => toggleSaved(m.id)} />)}</div>
          : <div className="empty-state"><Bookmark size={30} /><h3>Sua lista começa aqui</h3><p>Salve os filmes que quer assistir e encontre todos neste espaço.</p><button className="btn-primary" onClick={() => setSection("Em destaque")}>Explorar filmes</button></div>
        ) : visibleMovies.length ? <div className="movie-grid">{visibleMovies.map(m => <MovieCard key={m.id} movie={m} saved={saved.includes(m.id)} onOpen={() => setSelected(m)} onSave={() => toggleSaved(m.id)} />)}</div>
          : <div className="empty-state"><Search size={30} /><h3>Nenhum filme encontrado</h3><p>Tente outro título ou selecione um gênero diferente.</p><button className="btn-secondary" onClick={() => { setQuery(""); setActiveGenre(0); }}>Limpar filtros</button></div>}
        {apiStatus === "live" && page < totalPages && section !== "Minha lista" && <div className="load-more-wrap"><p>Exibindo {movies.length.toLocaleString("pt-BR")} títulos nesta consulta de {totalResults.toLocaleString("pt-BR")} resultados.</p><button className="btn-primary load-more" disabled={loading} onClick={() => setPage(p => Math.min(p + 1, totalPages))}>Carregar mais filmes</button><span>Catálogo paginado para navegar sem deixar o site lento.</span></div>}
        <p className="catalog-note"><Film size={14} /> {apiStatus === "live" ? "Informações e imagens fornecidas pela The Movie Database (TMDB)." : "Prévia demonstrativa. Configure VITE_TMDB_API_KEY para pesquisar milhares de filmes reais."}</p>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-icon"><Clapperboard size={18} /></span><span>CINE<span className="brand-accent">VERSE</span></span></a><p>Feito para quem ama boas histórias.</p><span className="footer-small">Este catálogo apresenta informações de filmes e não hospeda filmes completos.</span><div className="footer-links"><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">Dados de filmes: TMDB</a><span>© {new Date().getFullYear()} CineVerse</span></div></footer>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="movie-modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button>
        {selected.backdrop_path && <div className="modal-backdrop-image" style={{ backgroundImage: `linear-gradient(0deg, #11131b, transparent), url(${image(selected.backdrop_path, "w1280")})` }} />}
        <div className="modal-body"><p className="section-kicker">DETALHES DO FILME</p><h2>{selected.title}</h2><div className="hero-meta"><span className="rating"><Star size={15} fill="currentColor" /> {(selected.vote_average || 0).toFixed(1)}</span><span>{year(selected)}</span><span>Idioma original: {(selected.original_language || "—").toUpperCase()}</span></div><p className="modal-overview">{selected.overview || "A sinopse deste filme ainda não está disponível."}</p>
          <div className="modal-actions"><button className="btn-primary" onClick={() => toggleSaved(selected.id)}>{saved.includes(selected.id) ? <Check size={17} /> : <Bookmark size={17} />}{saved.includes(selected.id) ? "Salvo na lista" : "Adicionar à minha lista"}</button><a className="btn-secondary trailer-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selected.title + " trailer oficial")}`} target="_blank" rel="noreferrer"><Play size={17} /> Procurar trailer</a></div>
          <p className="legal-note">Os trailers abrem resultados do YouTube. O CineVerse não disponibiliza cópias não autorizadas de filmes.</p>
        </div>
      </section></div>}
    </main>
  );
}

function MovieCard({ movie, saved, onOpen, onSave }: { movie: Movie; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return <article className="movie-card">
    <button className="poster-button" onClick={onOpen} aria-label={`Ver detalhes de ${movie.title}`}>
      {movie.poster_path ? <img className="poster" src={image(movie.poster_path)} alt={`Pôster de ${movie.title}`} loading="lazy" /> : <div className="poster poster-placeholder"><Film size={30} /><span>{movie.title}</span></div>}
      <span className="poster-overlay"><span className="play-circle"><Play size={20} fill="currentColor" /></span><span>Ver detalhes</span></span>
    </button>
    <button className={saved ? "save-button is-saved" : "save-button"} onClick={onSave} aria-label={saved ? "Remover da minha lista" : "Salvar na minha lista"}>{saved ? <Heart size={17} fill="currentColor" /> : <Bookmark size={17} />}</button>
    <div className="movie-info"><button className="movie-title" onClick={onOpen}>{movie.title}</button><div className="movie-subline"><span>{year(movie)}</span><span className="movie-rating"><Star size={12} fill="currentColor" />{movie.vote_average ? movie.vote_average.toFixed(1) : "—"}</span></div></div>
  </article>;
}
