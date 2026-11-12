# Luuney

<img src="luuney-logo-horizontal.svg" alt="Alt text" width="300" height="200">

[![CI](https://github.com/mxe1012/luuney/actions/workflows/ci.yml/badge.svg)](https://github.com/mxe1012/luuney/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/6ef88167-4408-4ba6-9535-7112b2195b98/deploy-status)](https://app.netlify.com/projects/luuney/deploys)

Luuney is a soft, dreamy music streaming app. Discover trending and new tracks, search for songs and artists, save favorites, and build your own playlists, all in a clean interface focused on listening.

Music is streamed from [Audius](https://audius.co), a free and open music platform. You don't need an account or an API key.

**Live site:** [luuney.netlify.app](https://luuney.netlify.app)

## Features

- **Discover**: browse the top 100 trending tracks and the latest uploads on Audius.
- **Search**: find tracks by title, or search for an artist and open their catalog. Results appear as you type.
- **Full audio player**: play/pause, seek, skip ±10 seconds, volume and mute, shuffle, and repeat (off / one / all).
- **Play queue**: playing a track from any list queues the rest of that list, so playback continues automatically.
- **Mini player**: a compact player takes over when you scroll down the page.
- **Visualizer**: animated frequency bars that move with the music.
- **Favorites**: save tracks with one click and play them back as a list.
- **Recents**: the last 50 tracks you played, newest first.
- **Custom playlists**: create playlists from the player, add tracks to them, and remove tracks or whole playlists.
- **Offline notice**: Luuney lets you know when you lose your connection.

Your favorites, recents, and playlists are saved in your browser's `localStorage`. They stay on your device, aren't synced between browsers, and are lost if you clear the site's data.

## Tech Stack

- **[React 19](https://react.dev)**: UI library
- **[TypeScript](https://www.typescriptlang.org)**
- **[Vite](https://vite.dev)**: build tool and dev server
- **[Audius API](https://docs.audius.co)**: music catalog and audio streaming
- **Web Audio API**: powers the visualizer
- **[Vitest](https://vitest.dev)** and **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro)** with jsdom: tests
- **[ESLint](https://eslint.org)**: linting
- **GitHub Actions**: CI
- **npm**: package manager

## Prerequisites

- **Node.js** 22.22.2+ (22.x), 24.15+, or 26+. These are the minimums for the test tools; CI uses Node 24.
- **npm** (bundled with Node.js)

You can check your installed versions with:

```bash
node --version
npm --version
```

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/mxe1012/luuney.git
    cd luuney
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open the local URL that Vite prints in your browser.

No environment variables are needed: Luuney calls the public Audius API directly from the browser.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Type-checks the project and builds it for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs the tests in watch mode |
| `npm test -- --run` | Runs the tests once and exits (what CI runs) |

## Testing

Tests live in `src/test/` and mirror the source tree. Each test has the same path as the module it covers:

```
src/ui/dashboard_components/AudioPlayer.tsx
src/test/ui/dashboard_components/AudioPlayer.test.tsx
```

Shared test helpers live at the top of `src/test/`:

- `fixtures.ts`: builders for tracks, artists, playlists, and Audius API responses
- `audioPlayerUIProps.ts`: default props for the player UI components

A few conventions:

- Each test file starts with `// @vitest-environment jsdom` when it needs a DOM.
- The Audius API is mocked with `vi.mock`, so tests never make network requests.
- jsdom can't play audio or draw on a canvas, so the player and visualizer tests use small fakes for `<audio>`, `AudioContext`, and the canvas.

## Continuous Integration

Every push to `main` and every pull request runs the [CI workflow](.github/workflows/ci.yml) on Node 24. It installs dependencies with `npm ci`, then runs:

1. `npm run lint`
2. `npm run build`
3. `npm test -- --run`

## Project Structure

```
src/
├── index.tsx              # entry point
├── App.tsx                # app shell: dashboard, snackbar provider, footer
├── hooks/                 # useLocalStorage, usePagination, SnackbarContext
├── utils/
│   ├── data.ts            # Audius API requests
│   ├── helpers.ts         # formatting and small utilities
│   └── types.ts           # shared types and component props
├── ui/
│   ├── Dashboard.tsx      # app state: player, queue, favorites, recents, playlists
│   ├── dashboard_components/
│   │   ├── AudioPlayer.tsx            # playback logic and the <audio> element
│   │   ├── audioplayer_components/    # player UI, buttons, visualizer
│   │   ├── PlaylistPane.tsx           # recents, favorites, and playlists tabs
│   │   ├── playlistpane_components/
│   │   ├── SearchListPane.tsx         # track and artist search
│   │   ├── searchlistpane_components/
│   │   └── ExtraListPane.tsx          # trending and latest lists
│   └── skeletons/         # loading placeholders
├── styles/                # CSS, one file per area
└── test/                  # tests, mirroring the folders above
```

## Contributing

1. Fork the repository.
2. Create a new branch for your changes:

    ```bash
    git switch -c feature/your-feature
    ```

3. Make your changes and add tests for them under `src/test/`, at the same path as the code you changed.
4. Make sure lint, build, and tests all pass:

    ```bash
    npm run lint
    npm run build
    npm test -- --run
    ```

5. Commit your changes:

    ```bash
    git commit -m "Add your feature"
    ```

6. Push your branch and open a pull request.

## Credits

Built by [Manny E.](https://github.com/mxe1012). All audio is streamed from [Audius](https://audius.co).
