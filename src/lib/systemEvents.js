import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function escapeField(value) {
  return String(value ?? '').replace(/\n/g, ' ').trim();
}

export function buildReminderText(reminder) {
  const parts = [
    `Reminder: ${escapeField(reminder.title)}`,
    reminder.message ? `Notes: ${escapeField(reminder.message)}` : null,
    reminder.priority ? `Priority: ${escapeField(reminder.priority)}` : null,
    reminder.dueAt ? `Due: ${new Date(reminder.dueAt).toISOString()}` : null,
    reminder.reminderAt ? `ReminderAt: ${new Date(reminder.reminderAt).toISOString()}` : null,
    `ItemId: ${escapeField(reminder.itemId)}`,
  ].filter(Boolean);

  return parts.join(' | ');
}

export async function emitSystemEvent({ text, mode = 'now' }) {
  const command = process.env.SYSTEM_EVENT_COMMAND || 'echo';
  const args = command === 'echo' ? [text] : ['system', 'event', '--text', text, '--mode', mode];
  return execFileAsync(command, args, { cwd: process.cwd() });
}

export async function sendRemindersToSystem(reminders) {
  const results = [];

  for (const reminder of reminders) {
    const text = buildReminderText(reminder);
    try {
      const result = await emitSystemEvent({ text, mode: 'now' });
      results.push({ ok: true, reminder, stdout: result.stdout?.trim() || '', stderr: result.stderr?.trim() || '' });
    } catch (error) {
      results.push({
        ok: false,
        reminder,
        error: error?.message || String(error),
        stdout: error?.stdout?.trim?.() || '',
        stderr: error?.stderr?.trim?.() || '',
      });
    }
  }

  return results;
}
