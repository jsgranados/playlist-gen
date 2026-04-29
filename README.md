# Spotify Playlist Generator

This project is structured as a hosted `Next.js` app with focused playlist-generation workflows exposed through a real web interface:

- Festival lineup to playlist
- Recent plays to playlist
- Setlist.fm artist setlists to playlist

## Stack

- Next.js App Router
- TypeScript
- Auth.js with Spotify OAuth
- Spotify Web API
- Zod validation
- Luxon date handling

## Features

- Spotify OAuth sign-in
- Public landing page plus authenticated app dashboard
- Create a new playlist or append to an existing playlist in every workflow
- Festival lineup matching against liked songs
- Recent-play filtering with Spotify's 50-track API limit called out in the UI
- Setlist.fm artist lookup and recent live-set matching
- Playlist deduplication before write
- Basic request throttling and same-origin protections on mutation routes

## Local Development

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Fill in your Spotify app values in `.env`.

4. In the Spotify Developer Dashboard, add this redirect URI:
   ```text
   http://127.0.0.1:3000/api/auth/callback/spotify
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

6. Open `http://127.0.0.1:3000`.

## Required Environment Variables

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
APP_URL=http://127.0.0.1:3000
NEXTAUTH_URL=http://127.0.0.1:3000
AUTH_SECRET=replace_me_with_a_long_random_secret
SETLISTFM_API_KEY=your_setlistfm_api_key
```

## Workflows

### Festival

- Input a festival lineup JSON URL
- The app extracts artist titles from the payload
- Your saved Spotify tracks are scanned for artist matches
- Matched tracks are added to a new or existing playlist

### Recent

- Input a start date/time and optional end date/time
- The app fetches your recent Spotify plays
- Results are limited by Spotify's public API to the most recent 50 plays
- Matching tracks are added to a new or existing playlist

### Setlist

- Input an artist name
- The app resolves the artist in setlist.fm and scans recent setlists
- Unique performed songs are resolved against Spotify tracks
- Matching tracks are added to a new or existing playlist

## Quality Checks

```bash
npm run test
npm run lint
npm run build
```

## Deployment Notes

### Recommended Host

Vercel is the cleanest fit for this app. It is a standard Next.js App Router app with
no database, no queues, and no long-running jobs.

### Vercel Deployment

1. Push the repo to GitHub.
2. Import it into Vercel as a Next.js project.
3. Set these production environment variables in Vercel:
   ```bash
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   APP_URL=https://playlist.yourdomain.com
   NEXTAUTH_URL=https://playlist.yourdomain.com
   AUTH_SECRET=replace_me_with_a_long_random_secret
   SETLISTFM_API_KEY=your_setlistfm_api_key
   ```
4. Add your production domain in Vercel.
5. In the Spotify Developer Dashboard, add this redirect URI:
   `https://playlist.yourdomain.com/api/auth/callback/spotify`
6. Deploy and verify:
   - `https://playlist.yourdomain.com/api/health`
   - Spotify sign-in
   - Festival, recent, and setlist workflows

### Production Notes

- Keep `AUTH_SECRET` stable across deployments.
- Preview deployments may not complete Spotify OAuth unless their exact preview callback
  URL is also registered in Spotify.
- If the Spotify app remains in development mode, only configured Spotify users can sign in.
- The `/api/health` endpoint returns deployment-safe readiness details and the expected
  Spotify callback URI without exposing secrets.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
