# CineVerse — readiness for full movies in Portuguese

This document describes the checks required before the app can advertise or play a full movie. TMDB supplies catalogue metadata only; it is not a source of movie files or streaming rights.

## Required before publishing a title

- [ ] **Distribution rights verified:** keep evidence for the exact film/version, commercial streaming use, Brazil territory, validity dates, and any restrictions.
- [ ] **Authorized playback source connected:** store the provider's asset ID and playback mode server-side; never expose provider secrets in browser code.
- [ ] **Full feature confirmed:** the asset is the complete film, not a trailer, teaser, clip, or search result.
- [ ] **Portuguese audio checked:** record whether Portuguese audio is actually available for this asset/version.
- [ ] **Portuguese subtitles checked:** record whether Portuguese subtitles are actually available; distinguish subtitles from closed captions when the provider does.
- [ ] **Access control tested:** only active, non-blocked subscriptions may request playback; expired or blocked accounts must be denied server-side.
- [ ] **Playback tested:** verify playback on mobile and desktop, errors, and that unauthorized users cannot retrieve a playback URL.

## Language labels

Use only confirmed statuses:
- confirmed: checked against the actual provider asset.
- unavailable: provider explicitly confirms the track is absent.
- unknown: not checked; do not display as available.

Do not infer audio or subtitle availability from the title, poster, synopsis, TMDB language metadata, or the existence of a dubbed version elsewhere.

## Safe UI states

- Rights or provider missing: “Filme completo indisponível no momento.”
- Portuguese audio unknown: “Áudio em português ainda não confirmado.”
- Portuguese subtitles unknown: “Legendas em português ainda não confirmadas.”
- Playback access denied: explain that an active subscription is required, without exposing a media URL.

## Source categories

A public-domain or free-license label is not enough by itself. Verify the rights for the exact version, soundtrack, subtitles, territory, and commercial use. Keep a record of the source and evidence before publication.

## Current implementation boundary

The interface preparation does not connect a streaming provider, grant rights, import movie files, or apply Supabase migrations. Do not mark a title as playable until the checks above are complete.
