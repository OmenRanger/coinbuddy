export function formatCurrency(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not estimated";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}

export function formatDate(value) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function valueRangeLabel(coin) {
  const low = formatCurrency(coin.estimatedValueLow);
  const mid = formatCurrency(coin.estimatedValueMid);
  const high = formatCurrency(coin.estimatedValueHigh);

  if (low === "Not estimated" && mid === "Not estimated" && high === "Not estimated") {
    return "Not estimated yet";
  }

  return `${low} to ${high} (mid ${mid})`;
}

export function getCollectionStats(coins = []) {
  const totalEstimatedLow = sum(coins.map((coin) => coin.estimatedValueLow));
  const totalEstimatedMid = sum(coins.map((coin) => coin.estimatedValueMid));
  const totalEstimatedHigh = sum(coins.map((coin) => coin.estimatedValueHigh));
  const missingPhotos = coins.filter((coin) => !coin.obverseImageUrl || !coin.reverseImageUrl).length;
  const needsReview = coins.filter((coin) => coin.needsReview).length;
  const favorites = coins.filter((coin) => coin.favorite).length;
  const highestValueCoins = [...coins]
    .filter((coin) => typeof coin.estimatedValueMid === "number")
    .sort((a, b) => (b.estimatedValueMid || 0) - (a.estimatedValueMid || 0))
    .slice(0, 3);
  const recentlyAdded = [...coins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return {
    totalCoins: coins.length,
    totalEstimatedLow,
    totalEstimatedMid,
    totalEstimatedHigh,
    missingPhotos,
    needsReview,
    favorites,
    highestValueCoins,
    recentlyAdded,
    byCountry: countBy(coins, "country"),
    byDenomination: countBy(coins, "denomination"),
    byYear: countBy(coins, "year"),
    byCondition: countBy(coins, "condition")
  };
}

export function searchCoins(coins = [], query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return coins;
  }

  return coins.filter((coin) => coinSearchText(coin).includes(normalized));
}

export function filterCoins(coins = [], filter = "all") {
  switch (filter) {
    case "favorites":
      return coins.filter((coin) => coin.favorite);
    case "needsReview":
      return coins.filter((coin) => coin.needsReview);
    case "missingPhotos":
      return coins.filter((coin) => !coin.obverseImageUrl || !coin.reverseImageUrl);
    default:
      return coins;
  }
}

export function sortCoins(coins = [], sort = "recent") {
  const sorted = [...coins];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "year":
      return sorted.sort((a, b) => String(a.year || "").localeCompare(String(b.year || "")));
    case "denomination":
      return sorted.sort((a, b) => String(a.denomination || "").localeCompare(String(b.denomination || "")));
    case "country":
      return sorted.sort((a, b) => String(a.country || "").localeCompare(String(b.country || "")));
    case "mintMark":
      return sorted.sort((a, b) => String(a.mintMark || "").localeCompare(String(b.mintMark || "")));
    case "condition":
      return sorted.sort((a, b) => String(a.condition || "").localeCompare(String(b.condition || "")));
    case "value":
      return sorted.sort((a, b) => (b.estimatedValueMid || 0) - (a.estimatedValueMid || 0));
    case "storageLocation":
      return sorted.sort((a, b) => String(a.storageLocation || "").localeCompare(String(b.storageLocation || "")));
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export function coinSearchText(coin) {
  return [
    coin.name,
    coin.country,
    coin.denomination,
    coin.year,
    coin.mintMark,
    coin.condition,
    coin.storageLocation,
    coin.notes,
    ...(coin.tags || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function countBy(coins, key) {
  return coins.reduce((result, coin) => {
    const label = coin[key] || "Not recorded";
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});
}

function sum(values) {
  return values.reduce((total, value) => total + (typeof value === "number" ? value : 0), 0);
}
