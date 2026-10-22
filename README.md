# LessonsWebsite

LessonsWebsite is a lesson-learning app with an Expo frontend and an Express/MySQL backend.

## Development setup

The recommended local setup runs MySQL and the backend with Docker Compose. See [DOCKER.md](./DOCKER.md) for setup instructions, environment variables, test accounts, and useful commands.

Start the frontend in a separate terminal:

```powershell
Set-Location frontend
npm install
$env:EXPO_PUBLIC_API_URL = "http://localhost:5001/api"
npm run web
```

The web app is available at `http://localhost:8081`. For Android or iOS, see the Expo scripts in [frontend/package.json](./frontend/package.json).

## Project structure

- `frontend/` - Expo app for web and mobile
- `backend/` - Express API, MySQL initialization scripts, and quiz seed data
- `docker-compose.yml` - local MySQL and backend services
- `DOCKER.md` - detailed local development guide

## Collaboration

Use feature branches and pull requests so changes can be reviewed before they are merged. Keep local environment files, database dumps, and uploaded-file archives out of Git. The SQL files under `backend/mysql-clean-init/` are the clean database schema and test-account setup used by Docker Compose.
