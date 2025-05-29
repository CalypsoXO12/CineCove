# CineCove - Render Deployment Guide

## Environment Variables Required for Render

When deploying to Render, you need to set these environment variables in your service settings:

### Required Variables:

1. **NODE_ENV**
   - Value: `production`
   - Description: Sets the application to production mode

2. **TMDB_API_KEY**
   - Value: Your TMDB API key from https://www.themoviedb.org/
   - Description: Required for movie/TV show search functionality
   - How to get: Create account → Settings → API → Request API Key (free)

3. **DATABASE_URL**
   - Value: Automatically provided by Render when you connect a PostgreSQL database
   - Description: PostgreSQL connection string

### Database Setup:

1. Create a PostgreSQL database in Render
2. Connect it to your web service
3. The DATABASE_URL will be automatically set

### Deployment Steps:

1. Fork/connect your repository to Render
2. Create a new Web Service
3. Set environment variables above
4. Connect PostgreSQL database
5. Deploy

### Post-Deployment:

- Admin login: Username `Calypso`, Password `lordofdarkness12`
- Media search will work once TMDB API key is configured
- All other features work immediately after deployment

### Files Ready for Production:

- ✓ Enhanced error handling for API failures
- ✓ Graceful degradation when APIs are unavailable
- ✓ PostgreSQL database configuration
- ✓ Optimized for Render deployment
- ✓ All CRUD operations working
- ✓ Admin panel fully functional