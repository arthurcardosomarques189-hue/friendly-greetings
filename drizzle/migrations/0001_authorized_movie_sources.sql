CREATE TABLE public.movie_sources (movie_id integer PRIMARY KEY, title text NOT NULL, playback_url text NOT NULL, rights_confirmed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.movie_sources TO authenticated;
GRANT ALL ON public.movie_sources TO service_role;
ALTER TABLE public.movie_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_sources ON public.movie_sources FOR SELECT TO authenticated USING(public.has_role(auth.uid(), 'admin'));
CREATE VIEW public.available_movies WITH (security_barrier = true) AS SELECT movie_id, title FROM public.movie_sources WHERE rights_confirmed = true;
GRANT SELECT ON public.available_movies TO anon, authenticated, service_role;