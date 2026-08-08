import { Hono } from 'hono';
import type { Env } from '../index';

const settingsRouter = new Hono<{ Bindings: Env }>();

// Get settings for a user
settingsRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  
  const settings = await db.prepare(
    'SELECT * FROM cycle_settings WHERE user_id = ?'
  ).bind(userId).first();
  
  if (!settings) {
    // Return default settings if none exist
    return c.json({
      settings: {
        average_cycle_length: 28,
        average_period_length: 5,
        luteal_phase_length: 14,
        reminder_enabled: true,
        reminder_days_before: 2
      }
    });
  }
  
  // Convert integer flags to boolean
  return c.json({
    settings: {
      average_cycle_length: settings.average_cycle_length,
      average_period_length: settings.average_period_length,
      luteal_phase_length: settings.luteal_phase_length,
      reminder_enabled: settings.reminder_enabled === 1,
      reminder_days_before: settings.reminder_days_before
    }
  });
});

// Create or update settings
settingsRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const settingsData = await c.req.json();
  
  const {
    average_cycle_length,
    average_period_length,
    luteal_phase_length,
    reminder_enabled,
    reminder_days_before
  } = settingsData;
  
  const id = crypto.randomUUID();
  
  try {
    const result = await db.prepare(`
      INSERT INTO cycle_settings (
        id, user_id, average_cycle_length, average_period_length, luteal_phase_length,
        reminder_enabled, reminder_days_before
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        average_cycle_length = excluded.average_cycle_length,
        average_period_length = excluded.average_period_length,
        luteal_phase_length = excluded.luteal_phase_length,
        reminder_enabled = excluded.reminder_enabled,
        reminder_days_before = excluded.reminder_days_before,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id, userId, average_cycle_length, average_period_length, luteal_phase_length,
      reminder_enabled ? 1 : 0, reminder_days_before
    ).run();
    
    return c.json({ success: true, id, result });
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

export { settingsRouter };
