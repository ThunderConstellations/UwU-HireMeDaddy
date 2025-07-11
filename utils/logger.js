export async function logApplication(data) {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("apps", { keyPath: "ts" });
    req.onsuccess = () => res(req.result);
  });

  const now = Date.now();
  await db.transaction("apps", "readwrite").objectStore("apps").add({
    site: data.site || '',
    title: data.title || '',
    company: data.company || '',
    jobLink: data.jobLink || '',
    contactInfo: data.contactInfo || '',
    location: data.location || '',
    appliedAt: data.appliedAt || now,
    payRate: data.payRate || '',
    status: data.status || '',
    ts: now
  });

  chrome.runtime.sendMessage({
    type: "notify",
    text: `Applied to ${data.title} @ ${data.company}`
  });
}

export async function getApps() {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onsuccess = () => res(req.result);
  });

  return new Promise(res => {
    const result = [];
    const cursor = db.transaction("apps", "readonly").objectStore("apps").openCursor();
    cursor.onsuccess = e => {
      const cur = e.target.result;
      if (cur) {
        // Migrate old entries to new format
        const v = cur.value;
        result.push({
          site: v.site || '',
          title: v.title || '',
          company: v.company || '',
          jobLink: v.jobLink || '',
          contactInfo: v.contactInfo || '',
          location: v.location || '',
          appliedAt: v.appliedAt || v.ts,
          payRate: v.payRate || '',
          status: v.status || '',
          ts: v.ts
        });
        cur.continue();
      } else {
        res(result);
      }
    };
  });
}

// Winston-style rotating error log: purge logs older than 7 days
async function purgeOldLogs(store, days = 7) {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onsuccess = () => res(req.result);
  });
  const tx = db.transaction(store, "readwrite");
  const objStore = tx.objectStore(store);
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const cursorReq = objStore.openCursor();
  cursorReq.onsuccess = e => {
    const cur = e.target.result;
    if (cur) {
      if (cur.value.ts < cutoff) {
        objStore.delete(cur.primaryKey);
      }
      cur.continue();
    }
  };
}

export async function logError(error, context = {}) {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("errors", { keyPath: "ts" });
    req.onsuccess = () => res(req.result);
  });
  const now = Date.now();
  const entry = {
    ...context,
    error: error?.toString?.() || String(error),
    stack: error?.stack || new Error().stack,
    severity: context.severity || 'error',
    ts: now
  };
  await db.transaction("errors", "readwrite").objectStore("errors").add(entry);
  // Purge old logs
  purgeOldLogs("errors");
  chrome.runtime.sendMessage({
    type: "notify",
    text: `\u274c Error: ${entry.error}`
  });
}

export async function getErrors() {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onsuccess = () => res(req.result);
  });

  return new Promise(res => {
    const result = [];
    const cursor = db.transaction("errors", "readonly").objectStore("errors").openCursor();
    cursor.onsuccess = e => {
      const cur = e.target.result;
      if (cur) {
        result.push(cur.value);
        cur.continue();
      } else {
        res(result);
      }
    };
  });
}