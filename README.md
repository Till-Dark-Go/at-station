# @station

Enjoy a geospatial pomodoro-styled web application, designed to help users focus on their daily tasks and work with as few distractions as possible.

---

## Features

- **Interactive Map** — Powered by Mapbox GL. Browse stations across Europe, click a destination, and start a simulated train journey with an animated map movement, a moving train icon, and a live route line.

- **Journey Timer** — A live countdown tracks the remaining travel time, calculated using the Haversine formula based on real geographic coordinates.

- **Stamps Collection** — Each completed journey earns a stamp for the destination station. Stamps are paginated with lazy loading via the Intersection Observer API, and can be sorted by last visited or alphabetically.

- **Travel Log** — Every completed journey is recorded and viewable in the expanded stamp detail view.

- **To-Do List** — A frosted-glass panel for managing tasks during a session, backed by Firestore in real time.

- **Authentication** — Sign up and log in with email/password, Google, or GitHub. Protected routes redirect unauthenticated users automatically.

- **Profile Management** — Update your username, email, or password directly from the app. Account deletion is also supported.

---

## Tech Stack

| Category           | Technology                          |
| ------------------ | ----------------------------------- |
| Frontend           | React 19, React Router v7, Vite     |
| Map                | Mapbox GL JS, MapTiler SDK          |
| Backend / Database | Firebase (Firestore, Auth, Storage) |
| Styling            | Plain CSS with `clsx`               |
| Utilities          | Lodash, Intersection Observer API   |

---

## Project Structure

```
scripts/
├── upload-stations.js      # Admin script: seed Firestore stations collection
└── delete-stations.js      # Admin script: clear Firestore stations collection


src/
├── api/                    # Firebase read/write logic
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── styles/             # Per-component CSS files
│   └── utils/
│       ├── map/            # JS for all map logic/animations
│       └── useLazyLoad.js  # Generic lazy-loading hook
├── components/
│   ├── AccountManagement/  # SignUp, LogIn pages
│   ├── AuthPage/
│   ├── GreetingScreen/
│   ├── Map/                # UI components on the map
│   ├── Profile Page/      
│   ├── Stamps Page/        
│   └── ToDo/              
├── firebase/              
├── App.jsx
└── main.jsx
```

---

## Getting Started

### Prerequisites

- Node.js
- A [Firebase](https://firebase.google.com) project with **Firestore**, **Authentication**, and **Storage** enabled
- A [Mapbox](https://www.mapbox.com) account and access token

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Till-Dark-Go/at-station.git

cd at-station
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env-example` to `.env` and fill in your credentials:

```bash
cp .env-example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_MAPBOX_TOKEN=
```

4. **Seed the stations**

Generate a Firebase Admin service account key from **Project Settings → Service Accounts → Generate new private key**, save it as `scripts/service-account-key.json`, then run:

```bash
node scripts/upload-stations.js
```

5. **Start the development server**

```bash
npm run dev
```

---

## Firestore Rules Overview

| Collection                         | Access                        |
| ---------------------------------- | ----------------------------- |
| `/stations/{stationId}`            | Public read, admin-only write |
| `/users/{userId}`                  | Authenticated owner only      |
| `/users/{userId}/stamps/{stampId}` | Authenticated owner only      |
| `/users/{userId}/todos/{todoId}`   | Authenticated owner only      |

---

## Authentication

Three sign-in methods are supported: **Email/Password**, **Google**, and **GitHub**. On first sign-in, a Firestore user document is created automatically with a default starting station (Bern). Route access is controlled by a `RouteGuard` component that reads from a global `AuthContext`.

---

## Map Architecture

The map logic is split into focused custom hooks coordinated by a single `useMap` hook:

- `useMapSetup` — Initialises the Mapbox map, places station markers, and sets up the route and train icon layers.

- `useMarkers` — Attaches hover and click handlers to each station marker.

- `usePopup` — Manages the pre-travel confirmation popup state.

- `useTravel` — Handles the animated map movement, pause/resume, stopping mid-journey, and writing completed journeys to Firestore.

- `useStations` — Fetches and exports the full station list from Firestore at module load time.

---

## Scripts

```bash
npm run dev        # Start development server

npm run build      # Production build

npm run preview    # Preview production build

npm run lint       # Run ESLint
```

---

## Contributing

This is a collaborative student project. If you're a collaborator, branch off `main`, open a pull request, and request a review before merging.
