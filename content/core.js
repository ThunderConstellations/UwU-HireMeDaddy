(async () => {
  const host = window.location.hostname;

  if (host.includes("linkedin.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_linkedin.js"));
    module.run();
  } else if (host.includes("indeed.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_indeed.js"));
    module.run();
  } else if (host.includes("glassdoor.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_glassdoor.js"));
    module.run();
  } else if (host.includes("monster.com")) {
    const module = await import(chrome.runtime.getURL("content/sites/site_monster.js"));
    module.run();
  }
})();
