export const EMPTY_COIN = {
  id: "",
  name: "",
  country: "",
  denomination: "",
  year: "",
  mintMark: "",
  composition: "",
  condition: "",
  gradeEstimate: "",
  estimatedValueLow: undefined,
  estimatedValueMid: undefined,
  estimatedValueHigh: undefined,
  valueConfidence: "low",
  valueSources: [],
  obverseImageUrl: "",
  reverseImageUrl: "",
  acquisitionDate: "",
  acquisitionSource: "",
  purchasePrice: undefined,
  storageLocation: "",
  notes: "",
  tags: [],
  favorite: false,
  needsReview: false,
  createdAt: "",
  updatedAt: ""
};

export function createId(prefix = "coin") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createCoin(input = {}) {
  const now = nowIso();
  return {
    ...EMPTY_COIN,
    ...input,
    id: input.id || createId("coin"),
    name: input.name?.trim() || "Untitled coin",
    valueSources: Array.isArray(input.valueSources) ? input.valueSources : [],
    tags: Array.isArray(input.tags) ? input.tags : parseTags(input.tags),
    createdAt: input.createdAt || now,
    updatedAt: now
  };
}

export function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
