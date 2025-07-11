import { CONFIG } from "./utils/config.js";
const history = [];

export function scheduleApply(fn) {
  const now = Date.now();
  // Remove old entries
  while (history.length && now - history[0] > 24 * 3600e3) history.shift();
  if (history.length >= CONFIG.targetRate.perDay) return;
  history.push(now);
  const timeout = (3600e3 / CONFIG.targetRate.perHour) * history.length;
  setTimeout(fn, timeout);
}