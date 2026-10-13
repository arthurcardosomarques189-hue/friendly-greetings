# CineVerse dual-source movie catalog

This implementation prepares the database for two lawful catalog types:

- **Commercial licensed**: titles available under a written distribution/streaming agreement or an approved provider API.
- **Public domain / free license**: titles whose status is verified for the intended use and territory. "Free to watch" does not automatically mean "free to rebroadcast."

## Data model

- `catalog_providers`: provider type, activation state, and permitted territories.
- `catalog_movies`: searchable movie metadata, language availability, source type, rights status and validity dates, plus a provider asset identifier.
- Rows are visible to signed-in users only when published, rights-verified, in date, and associated with an active provider.
- No client-side write policies are provided. Admin imports and rights verification must happen server-side.
- Do not put provider API keys or secret tokens in frontend code, repository files, or movie metadata.

## Integration sequence

1. Choose a commercial supplier that explicitly permits subscription streaming in Brazil and confirms Portuguese audio/subtitle availability. Ask for API/SDK docs, commercial terms, DRM requirements, permitted devices, reporting obligations, and whether the plan permits a third-party service.
2. Add a provider adapter in a Supabase Edge Function. Store API credentials only in Supabase Edge Function Secrets.
3. Import metadata in batches and preserve the supplier's external movie ID. Do not scrape protected services.
4. For public-domain/free-license items, record a rights evidence URL and verify the exact work, version, soundtrack, subtitles, territory, and commercial-use terms. A poster or metadata license does not grant video rights.
5. Keep playback behind a server endpoint. The endpoint must check login, active subscription, territory and current rights, then request a short-lived playback token/URL from the provider. Never expose permanent private playback URLs.
6. Test expiration, revoked/expired rights, duplicate imports, missing Portuguese audio/subtitles, and unauthorized playback before publishing.

## Important limits

This migration creates a database foundation only. It does not itself provide a video catalog, grant distribution rights, download movies, connect a vendor, or make any titles available. A real provider agreement/API and server-side playback adapter are still required.
