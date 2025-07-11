export const storeData = async (key, value) => {
  const data = await chrome.storage.local.get("uwuData") || {};
  data[key] = value;
  await chrome.storage.local.set({ uwuData: data });
};

export const getData = async (key) => {
  const data = await chrome.storage.local.get("uwuData");
  return data?.uwuData?.[key];
};