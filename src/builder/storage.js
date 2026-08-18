import { STORAGE_KEY } from "./campaigns.js";

export function loadDrafts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDraft(campaign) {
  const drafts = loadDrafts();
  drafts[campaign.id] = campaign;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function clearDraft(campaignId) {
  const drafts = loadDrafts();
  delete drafts[campaignId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function mergeDrafts(campaigns) {
  const drafts = loadDrafts();
  return campaigns.map((campaign) => {
    const draft = drafts[campaign.id];
    return draft ? { ...campaign, ...draft, id: campaign.id, vertical: campaign.vertical } : campaign;
  });
}
