# CineCove

A comprehensive watchlist application for movies, TV shows, and anime with an ocean-themed design.

## Features

- **User Authentication**: Secure login and registration system
- **Media Management**: Add, edit, and track movies, TV shows, and anime
- **Admin Panel**: Admin-only features for managing announcements and featured content
- **Media Search**: Integration with TMDB and Jikan APIs for searching content
- **Ocean Theme**: Beautiful ocean-themed UI with deep blue color scheme
- **Mobile Responsive**: Works perfectly on all devices

## Deployment on Render

### Prerequisites

1. **TMDB API Key**: Required for movie/TV show search functionality
   - Create account at https://www.themoviedb.org/
   - Go to Settings > API > Request API Key (free)

### Environment Variables

Set these in your Render dashboard:

- `NODE_ENV=production`
- `TMDB_API_KEY=your_tmdb_api_key_here`
- `DATABASE_URL=your_postgresql_connection_string`

### Database Setup

The app uses PostgreSQL with Drizzle ORM. The database will be automatically set up when deployed.

## Admin Access

- **Username**: Calypso
- **Password**: lordofdarkness12

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```