import express from 'express';
import database from './config/database.js';
import { Activity, LeaderboardEntry, Team, User, Workout } from './models/index.js';
import { createCollectionRouter } from './routes/collectionRouter.js';

const app = express();
const port = 8000;
const codespaceName = process.env.CODESPACE_NAME;
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());

app.get('/', (_request, response) => {
  response.redirect('/api');
});

app.get('/api', (_request, response) => {
  response.json({
    baseUrl: apiBaseUrl,
    routes: ['users', 'teams', 'activities', 'leaderboard', 'workouts'],
  });
});

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: database.readyState === 1 ? 'connected' : 'connecting',
  });
});

app.use('/api/users', createCollectionRouter(User));
app.use('/api/teams', createCollectionRouter(Team));
app.use('/api/activities', createCollectionRouter(Activity));
app.use('/api/leaderboard', createCollectionRouter(LeaderboardEntry));
app.use('/api/workouts', createCollectionRouter(Workout));

app.listen(port, () => {
  console.log(`OctoFit API listening at ${apiBaseUrl}`);
});