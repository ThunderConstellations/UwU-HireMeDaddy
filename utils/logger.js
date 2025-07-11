export async function logApplication(data) {
  const db = await new Promise(res => {
    const req = indexedDB.open("UwUDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("apps", { keyPath: "ts" });
    req.onsuccess = () => res(req.result);
  });

  await db.transaction("apps", "readwrite").objectStore("apps").add({
    ...data,
    ts: Date.now()
  });

  // Trigger push notification
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
        result.push(cur.value);
        cur.continue();
      } else {
        res(result);
      }
    };
  });
}