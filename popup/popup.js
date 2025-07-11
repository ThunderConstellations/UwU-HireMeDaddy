import { getApps } from "../utils/logger.js";

async function loadHistory() {
  const apps = await getApps();
  const status = document.getElementById("status");
  const list = document.getElementById("history-list");
  if (apps.length === 0) {
    status.innerText = "No applications yet!";
    return;
  }

  status.innerText = `You've applied to ${apps.length} jobs so far.`;
  list.innerHTML = apps.map(app =>
    `<li><strong>${app.title}</strong> @ ${app.company} on ${new Date(app.ts).toLocaleDateString()} (${app.site})</li>`
  ).join("");
}

document.getElementById("export").addEventListener("click", async () => {
  const apps = await getApps();
  const csv = [
    "Date,Site,Title,Company,Status",
    ...apps.map(a => `${new Date(a.ts).toLocaleDateString()},${a.site},${a.title},${a.company},${a.status}`)
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "application_history.csv";
  a.click();
});

loadHistory();