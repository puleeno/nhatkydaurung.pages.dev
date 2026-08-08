import { Hono } from 'hono';
import type { Env } from '../index';

const logsRouter = new Hono<{ Bindings: Env }>();

// Get all logs for a user
logsRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  
  const logs = await db.prepare(
    'SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC'
  ).bind(userId).all();
  
  return c.json({ logs: logs.results });
});

// Get log for specific date
logsRouter.get('/:date', async (c) => {
  const userId = c.get('userId');
  const date = c.req.param('date');
  const db = c.env.DB;
  
  const log = await db.prepare(
    'SELECT * FROM daily_logs WHERE user_id = ? AND date = ?'
  ).bind(userId, date).first();
  
  if (!log) {
    return c.json({ error: 'Log not found' }, 404);
  }
  
  return c.json({ log });
});

// Create or update daily log
logsRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const logData = await c.req.json();
  
  const {
    date,
    is_period,
    flow,
    moods,
    symptoms,
    discharge,
    bbt,
    water_glasses,
    intimate,
    protected_intimate,
    pill_taken,
    notes
  } = logData;
  
  const id = crypto.randomUUID();
  
  try {
    const result = await db.prepare(`
      INSERT INTO daily_logs (
        id, user_id, date, is_period, flow, moods, symptoms, discharge,
        bbt, water_glasses, intimate, protected_intimate, pill_taken, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        is_period = excluded.is_period,
        flow = excluded.flow,
        moods = excluded.moods,
        symptoms = excluded.symptoms,
        discharge = excluded.discharge,
        bbt = excluded.bbt,
        water_glasses = excluded.water_glasses,
        intimate = excluded.intimate,
        protected_intimate = excluded.protected_intimate,
        pill_taken = excluded.pill_taken,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id, userId, date, is_period ? 1 : 0, flow, 
      JSON.stringify(moods || []), JSON.stringify(symptoms || []), discharge,
      bbt, water_glasses, intimate ? 1 : 0, protected_intimate ? 1 : 0, 
      pill_taken ? 1 : 0, notes
    ).run();
    
    return c.json({ success: true, id, result });
  } catch (error) {
    console.error('Error saving log:', error);
    return c.json({ error: 'Failed to save log' }, 500);
  }
});

// Delete log
logsRouter.delete('/:date', async (c) => {
  const userId = c.get('userId');
  const date = c.req.param('date');
  const db = c.env.DB;
  
  const result = await db.prepare(
    'DELETE FROM daily_logs WHERE user_id = ? AND date = ?'
  ).bind(userId, date).run();
  
  if (result.meta.changes === 0) {
    return c.json({ error: 'Log not found' }, 404);
  }
  
  return c.json({ success: true });
});

export { logsRouter };
