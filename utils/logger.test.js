// Jest test scaffolding for UwU-HireMeDaddy logger
// Inspired by github.com/winstonjs/winston, browser extension logging best practices
import { logError, getErrors } from './logger.js';

describe('UwU-HireMeDaddy Logger', () => {
  it('should log errors with timestamp, severity, and stack', async () => {
    await logError(new Error('Test error'), { severity: 'critical', action: 'test' });
    const errors = await getErrors();
    const last = errors[errors.length - 1];
    expect(last.error).toMatch('Test error');
    expect(last.severity).toBe('critical');
    expect(last.stack).toBeDefined();
    expect(typeof last.ts).toBe('number');
  });

  it('should purge logs older than 7 days', async () => {
    // Add a fake old error
    const oldTs = Date.now() - 8 * 24 * 60 * 60 * 1000;
    await indexedDB.open('UwUDB', 1).onsuccess = function(e) {
      const db = e.target.result;
      db.transaction('errors', 'readwrite').objectStore('errors').add({
        error: 'Old error', ts: oldTs, severity: 'info', stack: 'stacktrace' });
    };
    await logError('Recent error', { severity: 'info' });
    const errors = await getErrors();
    expect(errors.some(e => e.error === 'Old error')).toBe(false);
    expect(errors.some(e => e.error === 'Recent error')).toBe(true);
  });
}); 