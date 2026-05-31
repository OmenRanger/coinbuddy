import { articles } from "../data/articles.js";
import { createCoin, createId, nowIso, parseTags, toNumberOrUndefined } from "../data/schema.js";
import { formatCurrency, formatDate, getCollectionStats, searchCoins, filterCoins, sortCoins, valueRangeLabel } from "../lib/coinUtils.js";
import { exportCoinsAsCsv, exportCoinsAsJson, parseCoinBuddyJson } from "../lib/exporters.js";
import { applyEstimateToCoin, calculateEstimateFromSources, normalizeValueSource } from "../lib/valuation.js";
import {
  loadAuctionSources,
  loadCoins,
  loadTheme,
  removeCoin,
  saveAuctionSources,
  saveCoins,
  saveTheme,
  storageStatus,
  upsertCoin
} from "../lib/storage.js";

const app = document.querySelector("#app");
const nav = document.querySelector("#primary-nav");
const toastRegion = document.querySelector("#toast-region");

let coins = loadCoins();
let auctionSources = loadAuctionSources();

const navItems = [
  { route: "home", hash: "#/", label: "Home" },
  { route: "scan", hash: "#/scan", label: "Scan Coin" },
  { route: "add", hash: "#/add", label: "Add Coin" },
  { route: "collection", hash: "#/collection", label: "My Collection" },
  { route: "value", hash: "#/value", label: "Value Estimate" },
  { route: "archive", hash: "#/archive", label: "Archive" },
  { route: "learn", hash: "#/learn", label: "Learn" },
  { route: "auctions", hash: "#/auctions", label: "Auctions" },
  { route: "settings", hash: "#/settings", label: "Settings" }
];

document.documentElement.dataset.theme = loadTheme() === "contrast" ? "contrast" : "classic";
window.addEventListener("hashchange", render);
render();
registerServiceWorker();

function render() {
  coins = loadCoins();
  auctionSources = loadAuctionSources();
  const route = getRoute();
  renderNav(route.name);

  const routeHandlers = {
    home: renderHome,
    scan: () => renderCoinForm({ mode: "scan" }),
    add: () => renderCoinForm({ mode: "add" }),
    collection: renderCollection,
    coin: () => renderCoinDetail(route.id),
    edit: () => renderCoinForm({ mode: "edit", id: route.id }),
    value: renderValueEstimator,
    archive: renderArchive,
    learn: renderLearn,
    auctions: renderAuctions,
    settings: renderSettings
  };

  const handler = routeHandlers[route.name] || renderHome;
  handler();
  app.focus({ preventScroll: true });
}

function getRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return {
    name: parts[0] || "home",
    id: parts[1] || ""
  };
}

function renderNav(activeRoute) {
  nav.innerHTML = navItems
    .map(
      (item) =>
        `<a class="nav-link" href="${item.hash}" ${item.route === activeRoute ? 'aria-current="page"' : ""}>${item.label}</a>`
    )
    .join("");
}

function renderHome() {
  const stats = getCollectionStats(coins);
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <div>
          <p class="eyebrow">Vintage ledger, modern helper</p>
          <h2 class="hero-title">CoinBuddy</h2>
          <p class="hero-subtitle">
            A calm place to photograph coins, keep ownership records, estimate a careful market range, and prepare useful exports.
          </p>
        </div>
        <div class="action-grid" aria-label="Main actions">
          ${actionLink("#/scan", "Scan Coin", "Add front and back photos.")}
          ${actionLink("#/add", "Add Coin Manually", "Use simple fields and save.")}
          ${actionLink("#/collection", "My Collection", "Search, sort, and review coins.")}
          ${actionLink("#/value", "Value Estimate", "Enter comparable sales.")}
          ${actionLink("#/archive", "Archive & Reports", "Export records for safekeeping.")}
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <img src="./src/assets/coinbuddy-medallion.png" alt="" />
      </div>
    </section>

    <section class="page" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title">Collection Summary</h2>
      ${stats.needsReview ? `<div class="alert"><strong>${stats.needsReview} coin${stats.needsReview === 1 ? "" : "s"} need review.</strong> Add missing details when you have a quiet minute.</div>` : ""}
      <div class="stats-grid">
        ${statCard(stats.totalCoins, "Total coins")}
        ${statCard(formatCurrency(stats.totalEstimatedMid), "Estimated mid value")}
        ${statCard(stats.missingPhotos, "Missing photos")}
        ${statCard(stats.favorites, "Favorites")}
      </div>
      <div class="panel">
        <h3>Recently Added</h3>
        ${stats.recentlyAdded.length ? `<div class="collection-grid">${stats.recentlyAdded.map(coinCard).join("")}</div>` : emptyState("No coins yet.", "Start with Scan Coin or Add Coin Manually.")}
      </div>
      <div class="summary-grid">
        ${countPanel("By country", stats.byCountry)}
        ${countPanel("By denomination", stats.byDenomination)}
        ${countPanel("By condition", stats.byCondition)}
      </div>
    </section>
  `;
}

function renderCoinForm({ mode, id } = {}) {
  const existing = id ? coins.find((coin) => coin.id === id) : undefined;
  if (mode === "edit" && !existing) {
    renderNotFound("That coin was not found.");
    return;
  }

  const coin = existing || {};
  const isScan = mode === "scan";
  const title = mode === "edit" ? "Edit Coin" : isScan ? "Scan Coin" : "Add Coin Manually";
  const intro = isScan
    ? "Attach clear front and back photos, then confirm the details you know."
    : "Fill in what you know now. You can come back and add more later.";

  app.innerHTML = `
    <section class="page" aria-labelledby="coin-form-title">
      <div>
        <p class="eyebrow">Collection record</p>
        <h2 id="coin-form-title">${title}</h2>
        <p class="soft-note">${intro}</p>
      </div>
      <form id="coin-form" class="page">
        <section class="form-section" aria-labelledby="photo-section">
          <h3 id="photo-section">${isScan ? "Coin Photos" : "Photos"}</h3>
          <div class="image-pair">
            ${imageUploadBlock("obverseImage", "Front photo", coin.obverseImageUrl)}
            ${imageUploadBlock("reverseImage", "Back photo", coin.reverseImageUrl)}
          </div>
        </section>

        <section class="form-section" aria-labelledby="identity-section">
          <h3 id="identity-section">Coin Details</h3>
          <div class="form-grid">
            ${field("name", "Coin name", coin.name, "Example: 1909 Lincoln Wheat Cent", true)}
            ${field("country", "Country", coin.country, "Example: United States")}
            ${field("denomination", "Denomination", coin.denomination, "Example: One cent")}
            ${field("year", "Year", coin.year, "Example: 1909")}
            ${field("mintMark", "Mint mark", coin.mintMark, "Example: S")}
            ${field("composition", "Material or composition", coin.composition, "Example: copper")}
            ${field("condition", "Condition estimate", coin.condition, "Example: Fine")}
            ${field("gradeEstimate", "Grade note", coin.gradeEstimate, "Use careful wording, such as possible VF.")}
          </div>
        </section>

        <section class="form-section" aria-labelledby="value-section">
          <h3 id="value-section">Estimated Market Range</h3>
          <p class="helper">These are personal research estimates, not official appraisals.</p>
          <div class="form-grid">
            ${field("estimatedValueLow", "Low estimate", coin.estimatedValueLow, "Numbers only, such as 15", false, "number")}
            ${field("estimatedValueMid", "Mid estimate", coin.estimatedValueMid, "Numbers only, such as 25", false, "number")}
            ${field("estimatedValueHigh", "High estimate", coin.estimatedValueHigh, "Numbers only, such as 40", false, "number")}
            <label>
              Estimate confidence
              <select name="valueConfidence">
                ${option("low", "Low", coin.valueConfidence)}
                ${option("medium", "Medium", coin.valueConfidence)}
                ${option("high", "High", coin.valueConfidence)}
              </select>
              <span class="helper">Use high only when several reliable sale examples agree.</span>
            </label>
          </div>
        </section>

        <section class="form-section" aria-labelledby="archive-section">
          <h3 id="archive-section">Archive Notes</h3>
          <div class="form-grid">
            ${field("acquisitionDate", "Acquisition date", coin.acquisitionDate, "", false, "date")}
            ${field("acquisitionSource", "Acquisition source", coin.acquisitionSource, "Example: inherited, coin shop, auction")}
            ${field("purchasePrice", "Purchase price", coin.purchasePrice, "Numbers only, if known", false, "number")}
            ${field("storageLocation", "Storage location", coin.storageLocation, "Example: blue binder, safe box")}
            ${field("tags", "Tags", (coin.tags || []).join(", "), "Example: wheat cent, family, needs holder")}
          </div>
          <label>
            Notes
            <textarea name="notes" placeholder="Add history, reminders, or questions.">${escapeHtml(coin.notes || "")}</textarea>
          </label>
          <div class="form-grid">
            <label class="checkbox-row">
              <input type="checkbox" name="favorite" ${coin.favorite ? "checked" : ""} />
              Favorite
            </label>
            <label class="checkbox-row">
              <input type="checkbox" name="needsReview" ${coin.needsReview || isScan ? "checked" : ""} />
              Mark as needs review
            </label>
          </div>
        </section>

        <div class="button-row">
          <button class="brass" type="submit">${mode === "edit" ? "Save Changes" : "Add Coin to My Collection"}</button>
          <a class="button-link secondary" href="${existing ? `#/coin/${existing.id}` : "#/"}">Cancel</a>
        </div>
      </form>
    </section>
  `;

  const form = document.querySelector("#coin-form");
  wireImagePreview(form, "obverseImage");
  wireImagePreview(form, "reverseImage");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nextCoin = await readCoinForm(form, existing);
    coins = upsertCoin(nextCoin);
    showToast(existing ? "Coin updated." : "Coin added to your collection.");
    location.hash = `#/coin/${nextCoin.id}`;
  });
}

function renderCollection() {
  app.innerHTML = `
    <section class="page" aria-labelledby="collection-title">
      <div>
        <p class="eyebrow">Inventory</p>
        <h2 id="collection-title">My Collection</h2>
        <p class="soft-note">Search, sort, and open coins without digging through menus.</p>
      </div>
      <div class="toolbar panel">
        <label>
          Search collection
          <input id="collection-search" type="search" placeholder="Try year, country, denomination, or notes" />
        </label>
        <label>
          Sort by
          <select id="collection-sort">
            <option value="recent">Recently added</option>
            <option value="name">Name</option>
            <option value="year">Year</option>
            <option value="denomination">Denomination</option>
            <option value="country">Country</option>
            <option value="mintMark">Mint mark</option>
            <option value="condition">Condition</option>
            <option value="value">Estimated value</option>
            <option value="storageLocation">Storage location</option>
          </select>
        </label>
        <label>
          Show
          <select id="collection-filter">
            <option value="all">All coins</option>
            <option value="favorites">Favorites</option>
            <option value="needsReview">Needs review</option>
            <option value="missingPhotos">Missing photos</option>
          </select>
        </label>
      </div>
      <div id="collection-results" class="collection-grid" aria-live="polite"></div>
    </section>
  `;

  const update = () => {
    const query = document.querySelector("#collection-search").value;
    const sort = document.querySelector("#collection-sort").value;
    const filter = document.querySelector("#collection-filter").value;
    const visible = sortCoins(filterCoins(searchCoins(coins, query), filter), sort);
    document.querySelector("#collection-results").innerHTML = visible.length
      ? visible.map(coinCard).join("")
      : emptyState("No coins match that view.", "Try a different search or add a new coin.");
  };

  document.querySelector("#collection-search").addEventListener("input", update);
  document.querySelector("#collection-sort").addEventListener("change", update);
  document.querySelector("#collection-filter").addEventListener("change", update);
  update();
}

function renderCoinDetail(id) {
  const coin = coins.find((item) => item.id === id);
  if (!coin) {
    renderNotFound("That coin was not found.");
    return;
  }

  app.innerHTML = `
    <section class="page" aria-labelledby="detail-title">
      <div class="button-row">
        <a class="button-link secondary" href="#/collection">Back to My Collection</a>
        <a class="button-link" href="#/edit/${coin.id}">Edit Coin</a>
        <button class="danger" id="delete-coin" type="button">Delete Coin</button>
      </div>
      <div>
        <p class="eyebrow">Coin detail</p>
        <h2 id="detail-title">${escapeHtml(coin.name)}</h2>
        <p class="soft-note">${escapeHtml([coin.year, coin.country, coin.denomination].filter(Boolean).join(" - ") || "Details can be added anytime.")}</p>
      </div>

      <div class="detail-layout">
        <section class="panel" aria-labelledby="detail-photos">
          <h3 id="detail-photos">Photos</h3>
          <div class="image-pair">
            ${detailImage("Front photo", coin.obverseImageUrl)}
            ${detailImage("Back photo", coin.reverseImageUrl)}
          </div>
        </section>

        <section class="panel" aria-labelledby="detail-record">
          <h3 id="detail-record">Record</h3>
          <div class="meta-grid">
            ${keyValue("Country", coin.country)}
            ${keyValue("Denomination", coin.denomination)}
            ${keyValue("Year", coin.year)}
            ${keyValue("Mint mark", coin.mintMark)}
            ${keyValue("Composition", coin.composition)}
            ${keyValue("Condition estimate", coin.condition)}
            ${keyValue("Grade note", coin.gradeEstimate)}
            ${keyValue("Storage location", coin.storageLocation)}
            ${keyValue("Acquisition date", coin.acquisitionDate ? formatDate(coin.acquisitionDate) : "")}
            ${keyValue("Acquisition source", coin.acquisitionSource)}
          </div>
          <p><strong>Estimated market range:</strong> ${escapeHtml(valueRangeLabel(coin))}</p>
          <p class="soft-note">Estimate confidence: ${escapeHtml(capitalize(coin.valueConfidence || "low"))}. This is not an official appraisal.</p>
          ${coin.notes ? `<p><strong>Notes:</strong> ${escapeHtml(coin.notes)}</p>` : ""}
          ${coin.tags?.length ? `<div class="badge-row">${coin.tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        </section>
      </div>

      <section class="panel" aria-labelledby="comparable-title">
        <h3 id="comparable-title">Comparable Sales</h3>
        ${coin.valueSources?.length ? valueSourcesList(coin.valueSources) : emptyState("No comparable sales yet.", "Add one below to improve the estimate.")}
        <form id="comparable-form" class="form-grid">
          ${field("sourceName", "Source name", "", "Example: auction result or dealer listing", true)}
          ${field("sourceUrl", "Source link", "", "Optional web address", false, "url")}
          ${field("saleDate", "Sale date", "", "", false, "date")}
          ${field("observedPrice", "Observed price", "", "Numbers only", true, "number")}
          <label>
            Notes
            <textarea name="notes" placeholder="Mention condition, grade, or why this sale is similar."></textarea>
          </label>
          <div class="button-row">
            <button class="brass" type="submit">Add Comparable Sale</button>
          </div>
        </form>
      </section>
    </section>
  `;

  document.querySelector("#delete-coin").addEventListener("click", () => {
    if (window.confirm("Delete this coin from CoinBuddy? This cannot be undone.")) {
      coins = removeCoin(coin.id);
      showToast("Coin deleted.");
      location.hash = "#/collection";
    }
  });

  document.querySelector("#comparable-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const source = normalizeValueSource(Object.fromEntries(formData.entries()));
    const updated = applyEstimateToCoin(coin, [...(coin.valueSources || []), source]);
    coins = upsertCoin(updated);
    showToast("Comparable sale added and estimate updated.");
    renderCoinDetail(coin.id);
  });
}

function renderValueEstimator() {
  app.innerHTML = `
    <section class="page" aria-labelledby="value-title">
      <div>
        <p class="eyebrow">Careful research helper</p>
        <h2 id="value-title">Value Estimate</h2>
        <p class="soft-note">Enter recent comparable sales. CoinBuddy calculates an estimated market range and confidence level.</p>
      </div>
      <form id="estimate-form" class="panel page">
        <div class="form-grid">
          ${estimateRow(1)}
          ${estimateRow(2)}
          ${estimateRow(3)}
          ${estimateRow(4)}
          ${estimateRow(5)}
        </div>
        <div class="button-row">
          <button class="brass" type="submit">Calculate Estimated Range</button>
          <button class="secondary" type="reset">Clear</button>
        </div>
      </form>
      <section id="estimate-output" class="panel" aria-live="polite">
        ${emptyState("No estimate calculated yet.", "Add at least one sale example.")}
      </section>
    </section>
  `;

  document.querySelector("#estimate-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const sources = [1, 2, 3, 4, 5]
      .map((index) =>
        normalizeValueSource({
          sourceName: formData.get(`sourceName${index}`),
          saleDate: formData.get(`saleDate${index}`),
          observedPrice: formData.get(`observedPrice${index}`),
          notes: formData.get(`notes${index}`)
        })
      )
      .filter((source) => typeof source.observedPrice === "number");
    const estimate = calculateEstimateFromSources(sources);
    document.querySelector("#estimate-output").innerHTML = estimate.sourceCount
      ? `
        <h3>Estimated Market Range</h3>
        <div class="stats-grid">
          ${statCard(formatCurrency(estimate.low), "Low estimate")}
          ${statCard(formatCurrency(estimate.mid), "Mid estimate")}
          ${statCard(formatCurrency(estimate.high), "High estimate")}
          ${statCard(capitalize(estimate.confidence), "Estimate confidence")}
        </div>
        <p class="soft-note">${escapeHtml(estimate.reason)} This is not an official appraisal.</p>
      `
      : emptyState("No prices found.", "Enter at least one observed sale price.");
  });
}

function renderArchive() {
  const stats = getCollectionStats(coins);
  app.innerHTML = `
    <section class="page" aria-labelledby="archive-title">
      <div>
        <p class="eyebrow">Digital proof and export</p>
        <h2 id="archive-title">Archive & Reports</h2>
        <p class="soft-note">Keep a practical record for personal documentation, insurance conversations, and estate planning.</p>
      </div>
      <div class="stats-grid">
        ${statCard(stats.totalCoins, "Coins recorded")}
        ${statCard(formatCurrency(stats.totalEstimatedLow), "Total low estimate")}
        ${statCard(formatCurrency(stats.totalEstimatedMid), "Total mid estimate")}
        ${statCard(formatCurrency(stats.totalEstimatedHigh), "Total high estimate")}
      </div>
      <section class="panel">
        <h3>Exports</h3>
        <p class="soft-note">JSON keeps the full backup. CSV is easier to open in a spreadsheet.</p>
        <div class="button-row">
          <button id="export-json" class="brass" type="button">Export JSON</button>
          <button id="export-csv" type="button">Export CSV</button>
          <button id="print-report" class="secondary" type="button">Print Report</button>
        </div>
        <p id="export-status" class="helper" aria-live="polite"></p>
      </section>
      <section class="panel print-report" aria-labelledby="print-title">
        <h3 id="print-title">Printable Report Preview</h3>
        <p><strong>Prepared:</strong> ${formatDate(nowIso())}</p>
        <p><strong>Insurance-prep note:</strong> This report is general documentation only. For official coverage, contact an insurance professional or provider.</p>
        ${coins.length ? `<div class="collection-grid">${coins.map(reportCoinCard).join("")}</div>` : emptyState("No coins to report yet.", "Add coins first, then return here to export.")}
      </section>
    </section>
  `;

  document.querySelector("#export-json").addEventListener("click", () => {
    downloadText("coinbuddy-export.json", exportCoinsAsJson(coins), "application/json");
    setExportStatus("JSON export ready.");
  });
  document.querySelector("#export-csv").addEventListener("click", () => {
    downloadText("coinbuddy-export.csv", exportCoinsAsCsv(coins), "text/csv");
    setExportStatus("CSV export ready.");
  });
  document.querySelector("#print-report").addEventListener("click", () => window.print());
}

function renderLearn() {
  app.innerHTML = `
    <section class="page" aria-labelledby="learn-title">
      <div>
        <p class="eyebrow">Collector notes</p>
        <h2 id="learn-title">Learn</h2>
        <p class="soft-note">Short guidance for safe handling, storage, insurance preparation, market awareness, and beginner research.</p>
      </div>
      <div class="article-grid">
        ${articles
          .map(
            (article) => `
              <article class="article-card">
                <p class="eyebrow">${escapeHtml(article.category)}</p>
                <h3>${escapeHtml(article.title)}</h3>
                <p><strong>${escapeHtml(article.summary)}</strong></p>
                <p>${escapeHtml(article.body)}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <section class="alert">
        <strong>Careful note:</strong> CoinBuddy provides general guidance only. For grading, insurance, tax, estate, legal, or financial questions, talk with a qualified professional.
      </section>
    </section>
  `;
}

function renderAuctions() {
  app.innerHTML = `
    <section class="page" aria-labelledby="auction-title">
      <div>
        <p class="eyebrow">Market discovery</p>
        <h2 id="auction-title">Auctions</h2>
        <p class="soft-note">Save permitted research links and note sources for future comparable sales. CoinBuddy does not scrape third-party sites.</p>
      </div>
      <section class="panel">
        <h3>Add Source Link</h3>
        <form id="source-form" class="form-grid">
          ${field("name", "Source name", "", "Example: local coin shop listing", true)}
          ${field("url", "Source link", "", "https://...", true, "url")}
          <label>
            Notes
            <textarea name="notes" placeholder="What should you remember about this source?"></textarea>
          </label>
          <div class="button-row">
            <button class="brass" type="submit">Add Source</button>
          </div>
        </form>
      </section>
      <div id="source-list" class="source-grid"></div>
    </section>
  `;

  const renderSources = () => {
    document.querySelector("#source-list").innerHTML = auctionSources
      .map(
        (source) => `
          <article class="source-card">
            <h3>${escapeHtml(source.name)}</h3>
            <p>${escapeHtml(source.notes || "Saved source link.")}</p>
            <div class="button-row">
              <a class="button-link secondary" href="${attr(source.url)}" target="_blank" rel="noreferrer">Open Source</a>
              <button type="button" data-watch-source="${attr(source.id)}">${source.watched ? "Watching" : "Watch This Source"}</button>
            </div>
          </article>
        `
      )
      .join("");
    document.querySelectorAll("[data-watch-source]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-watch-source");
        auctionSources = auctionSources.map((source) => (source.id === id ? { ...source, watched: !source.watched } : source));
        saveAuctionSources(auctionSources);
        renderSources();
      });
    });
  };

  document.querySelector("#source-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const source = {
      id: createId("auction"),
      name: String(formData.get("name") || "").trim(),
      url: String(formData.get("url") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      watched: false,
      createdAt: nowIso()
    };
    auctionSources = [source, ...auctionSources];
    saveAuctionSources(auctionSources);
    event.currentTarget.reset();
    showToast("Auction source added.");
    renderSources();
  });
  renderSources();
}

function renderSettings() {
  const status = storageStatus();
  app.innerHTML = `
    <section class="page" aria-labelledby="settings-title">
      <div>
        <p class="eyebrow">Personal settings</p>
        <h2 id="settings-title">Settings</h2>
        <p class="soft-note">Export, import, and choose a comfortable reading theme.</p>
      </div>
      <section class="panel">
        <h3>Storage Status</h3>
        <div class="stats-grid">
          ${statCard(status.coins, "Coins in this browser")}
          ${statCard(status.sources, "Auction sources")}
          ${statCard(status.available ? "Ready" : "Unavailable", "Local storage")}
        </div>
      </section>
      <section class="panel">
        <h3>Theme</h3>
        <label>
          Display theme
          <select id="theme-select">
            <option value="classic" ${loadTheme() === "classic" ? "selected" : ""}>Classic Ledger</option>
            <option value="contrast" ${loadTheme() === "contrast" ? "selected" : ""}>High Contrast</option>
          </select>
        </label>
      </section>
      <section class="panel">
        <h3>Export And Import</h3>
        <p class="soft-note">Import replaces the current coins in this browser. Export first if you want a backup.</p>
        <div class="button-row">
          <button id="settings-export" class="brass" type="button">Export Backup JSON</button>
        </div>
        <label>
          Import CoinBuddy JSON
          <input id="import-file" type="file" accept="application/json,.json" />
        </label>
        <p id="settings-status" class="helper" aria-live="polite"></p>
      </section>
      <section class="panel">
        <h3>About CoinBuddy</h3>
        <p>CoinBuddy is a local-first MVP. Value ranges are research estimates and not official appraisals.</p>
      </section>
    </section>
  `;

  document.querySelector("#theme-select").addEventListener("change", (event) => {
    const theme = event.currentTarget.value;
    saveTheme(theme);
    document.documentElement.dataset.theme = theme === "contrast" ? "contrast" : "classic";
  });
  document.querySelector("#settings-export").addEventListener("click", () => {
    downloadText("coinbuddy-backup.json", exportCoinsAsJson(coins), "application/json");
    setSettingsStatus("Backup export ready.");
  });
  document.querySelector("#import-file").addEventListener("change", async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const importedCoins = parseCoinBuddyJson(text);
      saveCoins(importedCoins);
      coins = importedCoins;
      setSettingsStatus(`${importedCoins.length} coin records imported.`);
      showToast("CoinBuddy import complete.");
    } catch (error) {
      setSettingsStatus(error.message || "Import failed.");
    }
  });
}

async function readCoinForm(form, existing = {}) {
  const formData = new FormData(form);
  const obverseImageUrl = await imageInputToDataUrl(form.elements.namedItem("obverseImage"), existing.obverseImageUrl || "");
  const reverseImageUrl = await imageInputToDataUrl(form.elements.namedItem("reverseImage"), existing.reverseImageUrl || "");

  return createCoin({
    ...existing,
    name: formData.get("name"),
    country: formData.get("country"),
    denomination: formData.get("denomination"),
    year: formData.get("year"),
    mintMark: formData.get("mintMark"),
    composition: formData.get("composition"),
    condition: formData.get("condition"),
    gradeEstimate: formData.get("gradeEstimate"),
    estimatedValueLow: toNumberOrUndefined(formData.get("estimatedValueLow")),
    estimatedValueMid: toNumberOrUndefined(formData.get("estimatedValueMid")),
    estimatedValueHigh: toNumberOrUndefined(formData.get("estimatedValueHigh")),
    valueConfidence: formData.get("valueConfidence") || "low",
    obverseImageUrl,
    reverseImageUrl,
    acquisitionDate: formData.get("acquisitionDate"),
    acquisitionSource: formData.get("acquisitionSource"),
    purchasePrice: toNumberOrUndefined(formData.get("purchasePrice")),
    storageLocation: formData.get("storageLocation"),
    notes: formData.get("notes"),
    tags: parseTags(formData.get("tags")),
    favorite: formData.get("favorite") === "on",
    needsReview: formData.get("needsReview") === "on",
    createdAt: existing.createdAt
  });
}

function imageUploadBlock(name, label, imageUrl) {
  return `
    <label>
      ${label}
      ${imageUrl ? `<img class="coin-image" data-preview-for="${name}" src="${attr(imageUrl)}" alt="${label} preview" />` : `<span class="placeholder-image" data-preview-for="${name}">No ${label.toLowerCase()} yet</span>`}
      <input type="file" name="${name}" accept="image/*" />
      <span class="helper">Use a clear photo. Manual details are always available.</span>
    </label>
  `;
}

function wireImagePreview(form, name) {
  const input = form.elements.namedItem(name);
  const preview = form.querySelector(`[data-preview-for="${name}"]`);
  input.addEventListener("change", async () => {
    const dataUrl = await imageInputToDataUrl(input, "");
    if (!dataUrl || !preview) {
      return;
    }
    if (preview.tagName === "IMG") {
      preview.src = dataUrl;
    } else {
      const img = document.createElement("img");
      img.className = "coin-image";
      img.dataset.previewFor = name;
      img.src = dataUrl;
      img.alt = `${name} preview`;
      preview.replaceWith(img);
    }
  });
}

function imageInputToDataUrl(input, fallback) {
  const file = input?.files?.[0];
  if (!file) {
    return Promise.resolve(fallback);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function field(name, label, value = "", helper = "", required = false, type = "text") {
  return `
    <label>
      ${label}
      <input name="${name}" type="${type}" value="${attr(value ?? "")}" ${required ? "required" : ""} ${type === "number" ? 'step="0.01" min="0"' : ""} />
      ${helper ? `<span class="helper">${escapeHtml(helper)}</span>` : ""}
    </label>
  `;
}

function option(value, label, selected) {
  return `<option value="${attr(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function actionLink(hash, title, subtitle) {
  return `
    <a class="button-link secondary" href="${hash}">
      <span>${title}</span>
      <span class="visually-hidden">${escapeHtml(subtitle)}</span>
    </a>
  `;
}

function statCard(value, label) {
  return `<div class="stat-card"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

function coinCard(coin) {
  return `
    <article class="coin-card">
      ${coin.obverseImageUrl ? `<img src="${attr(coin.obverseImageUrl)}" alt="${escapeHtml(coin.name)} front photo" />` : `<div class="placeholder-image">Photo needed</div>`}
      <div>
        <h3>${escapeHtml(coin.name)}</h3>
        <p class="coin-meta">${escapeHtml([coin.year, coin.denomination, coin.country].filter(Boolean).join(" - ") || "Details not recorded")}</p>
        <p class="coin-meta">${escapeHtml(valueRangeLabel(coin))}</p>
      </div>
      <div class="badge-row">
        ${coin.favorite ? `<span class="badge">Favorite</span>` : ""}
        ${coin.needsReview ? `<span class="badge">Needs review</span>` : ""}
        ${!coin.obverseImageUrl || !coin.reverseImageUrl ? `<span class="badge">Missing photo</span>` : ""}
      </div>
      <a class="button-link" href="#/coin/${attr(coin.id)}">Open Coin Detail</a>
    </article>
  `;
}

function reportCoinCard(coin) {
  return `
    <article class="coin-card">
      <h3>${escapeHtml(coin.name)}</h3>
      <p>${escapeHtml([coin.year, coin.denomination, coin.country].filter(Boolean).join(" - ") || "Details not recorded")}</p>
      <p><strong>Estimated range:</strong> ${escapeHtml(valueRangeLabel(coin))}</p>
      <p><strong>Storage:</strong> ${escapeHtml(coin.storageLocation || "Not recorded")}</p>
    </article>
  `;
}

function countPanel(title, counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return `
    <section class="panel">
      <h3>${escapeHtml(title)}</h3>
      ${
        entries.length
          ? entries.map(([label, count]) => `<p><strong>${escapeHtml(count)}</strong> ${escapeHtml(label)}</p>`).join("")
          : `<p class="soft-note">No records yet.</p>`
      }
    </section>
  `;
}

function keyValue(label, value) {
  return `<div class="key-value"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Not recorded")}</strong></div>`;
}

function detailImage(label, url) {
  return url
    ? `<figure><img class="coin-image" src="${attr(url)}" alt="${label}" /><figcaption class="helper">${label}</figcaption></figure>`
    : `<div class="placeholder-image">${label} not added</div>`;
}

function valueSourcesList(sources) {
  return `
    <div class="source-grid">
      ${sources
        .map(
          (source) => `
            <article class="source-card">
              <h3>${escapeHtml(source.sourceName)}</h3>
              <p><strong>Observed price:</strong> ${escapeHtml(formatCurrency(source.observedPrice))}</p>
              <p><strong>Sale date:</strong> ${escapeHtml(source.saleDate ? formatDate(source.saleDate) : "Not recorded")}</p>
              ${source.sourceUrl ? `<p><a href="${attr(source.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a></p>` : ""}
              ${source.notes ? `<p>${escapeHtml(source.notes)}</p>` : ""}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function estimateRow(index) {
  return `
    <fieldset class="form-section">
      <legend>Sale example ${index}</legend>
      ${field(`sourceName${index}`, "Source name", "", "Example: auction result")}
      ${field(`saleDate${index}`, "Sale date", "", "", false, "date")}
      ${field(`observedPrice${index}`, "Observed price", "", "Numbers only", false, "number")}
      ${field(`notes${index}`, "Short note", "", "Condition, grade, or why it is similar")}
    </fieldset>
  `;
}

function emptyState(title, body) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div>`;
}

function renderNotFound(message) {
  app.innerHTML = `
    <section class="page">
      ${emptyState(message, "Return to the collection and choose another record.")}
      <a class="button-link" href="#/collection">Go to My Collection</a>
    </section>
  `;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setExportStatus(message) {
  document.querySelector("#export-status").textContent = message;
  showToast(message);
}

function setSettingsStatus(message) {
  document.querySelector("#settings-status").textContent = message;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.append(toast);
  setTimeout(() => toast.remove(), 2800);
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return escapeHtml(value);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}
