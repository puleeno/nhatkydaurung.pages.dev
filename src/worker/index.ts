import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { logsRouter } from './routes/logs';
import { cyclesRouter } from './routes/cycles';
import { settingsRouter } from './routes/settings';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// API routes with auth middleware
app.use('/api/*', authMiddleware);

app.route('/api/logs', logsRouter);
app.route('/api/cycles', cyclesRouter);
app.route('/api/settings', settingsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message 
  }, 500);
});

export default app;
