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
        reminder_days_before: 2,
        passcode_enabled: false,
        passcode: null
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
      reminder_days_before: settings.reminder_days_before,
      passcode_enabled: settings.passcode_enabled === 1,
      passcode: settings.passcode
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
    reminder_days_before,
    passcode_enabled,
    passcode
  } = settingsData;
  
  const id = crypto.randomUUID();
  
  try {
    // Ensure user exists
    await db.prepare(`
      INSERT INTO users (id) VALUES (?)
      ON CONFLICT(id) DO NOTHING
    `).bind(userId).run();
    
    const result = await db.prepare(`
      INSERT INTO cycle_settings (
        id, user_id, average_cycle_length, average_period_length, luteal_phase_length,
        reminder_enabled, reminder_days_before, passcode_enabled, passcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        average_cycle_length = excluded.average_cycle_length,
        average_period_length = excluded.average_period_length,
        luteal_phase_length = excluded.luteal_phase_length,
        reminder_enabled = excluded.reminder_enabled,
        reminder_days_before = excluded.reminder_days_before,
        passcode_enabled = excluded.passcode_enabled,
        passcode = excluded.passcode,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id, userId, average_cycle_length || 28, average_period_length || 5, luteal_phase_length || 14,
      reminder_enabled ? 1 : 0, reminder_days_before || 2, passcode_enabled ? 1 : 0, passcode || null
    ).run();
    
    return c.json({ success: true, id, result });
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// Verify passcode
settingsRouter.post('/verify-passcode', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const { passcode } = await c.req.json();
  
  const settings = await db.prepare(
    'SELECT passcode, passcode_enabled FROM cycle_settings WHERE user_id = ?'
  ).bind(userId).first();
  
  if (!settings) {
    return c.json({ valid: false, error: 'Settings not found' }, 404);
  }
  
  if (!settings.passcode_enabled || settings.passcode_enabled === 0) {
    return c.json({ valid: true, passcodeNotEnabled: true });
  }
  
  if (!settings.passcode) {
    return c.json({ valid: false, error: 'Passcode not set' }, 400);
  }
  
  if (settings.passcode === passcode) {
    return c.json({ valid: true });
  } else {
    return c.json({ valid: false, error: 'Incorrect passcode' }, 401);
  }
});

export { settingsRouter };
