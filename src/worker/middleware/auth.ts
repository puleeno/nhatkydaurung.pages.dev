import { Context, Next } from 'hono';

export const authMiddleware = async (c: Context, next: Next) => {
  // Simple user identification using a header or query param
  // In production, you'd want proper authentication
  const userId = c.req.header('X-User-ID') || c.req.query('userId') || 'default-user';
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 401);
  }

  // Add user ID to context
  c.set('userId', userId);
  
  await next();
};
