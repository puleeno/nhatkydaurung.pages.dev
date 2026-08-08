import { Hono } from 'hono';
import type { Env } from '../index';

const cyclesRouter = new Hono<{ Bindings: Env }>();

// Get all cycles for a user
cyclesRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  
  const cycles = await db.prepare(
    'SELECT * FROM period_cycles WHERE user_id = ? ORDER BY start_date DESC'
  ).bind(userId).all();
  
  return c.json({ cycles: cycles.results });
});

// Get specific cycle
cyclesRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const db = c.env.DB;
  
  const cycle = await db.prepare(
    'SELECT * FROM period_cycles WHERE user_id = ? AND id = ?'
  ).bind(userId, id).first();
  
  if (!cycle) {
    return c.json({ error: 'Cycle not found' }, 404);
  }
  
  return c.json({ cycle });
});

// Create new cycle
cyclesRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const cycleData = await c.req.json();
  
  const {
    start_date,
    end_date,
    length_in_days,
    cycle_length
  } = cycleData;
  
  const id = crypto.randomUUID();
  
  try {
    // Ensure user exists
    await db.prepare(`
      INSERT INTO users (id) VALUES (?)
      ON CONFLICT(id) DO NOTHING
    `).bind(userId).run();
    
    const result = await db.prepare(`
      INSERT INTO period_cycles (id, user_id, start_date, end_date, length_in_days, cycle_length)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, userId, start_date, end_date, length_in_days || null, cycle_length || null).run();
    
    return c.json({ success: true, id, result });
  } catch (error) {
    console.error('Error creating cycle:', error);
    return c.json({ error: 'Failed to create cycle' }, 500);
  }
});

// Update cycle
cyclesRouter.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const db = c.env.DB;
  const cycleData = await c.req.json();
  
  const {
    end_date,
    length_in_days,
    cycle_length
  } = cycleData;
  
  try {
    const result = await db.prepare(`
      UPDATE period_cycles
      SET end_date = ?, length_in_days = ?, cycle_length = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND id = ?
    `).bind(end_date, length_in_days || null, cycle_length || null, userId, id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    return c.json({ success: true, result });
  } catch (error) {
    console.error('Error updating cycle:', error);
    return c.json({ error: 'Failed to update cycle' }, 500);
  }
});

// Delete cycle
cyclesRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const db = c.env.DB;
  
  const result = await db.prepare(
    'DELETE FROM period_cycles WHERE user_id = ? AND id = ?'
  ).bind(userId, id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ error: 'Cycle not found' }, 404);
  }
  
  return c.json({ success: true });
});

export { cyclesRouter };
