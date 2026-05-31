import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import { join, resolve } from "node:path";
import { startStaticServer } from "./serve.mjs";

const { chromium } = await loadPlaywright();
const { server, url } = await startStaticServer(process.cwd(), 4273);
const browser = await chromium.launch(findBrowserLaunchOptions());
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on("dialog", (dialog) => dialog.accept());

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expectText(page, "CoinBuddy");
  await expectText(page, "Collection Summary");

  await page.getByRole("link", { name: /Add Coin Manually/i }).click();
  await page.getByLabel("Coin name").fill("1909 Lincoln Wheat Cent");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Denomination").fill("One cent");
  await page.getByLabel("Year").fill("1909");
  await page.getByLabel("Mint mark").fill("S");
  await page.getByLabel("Storage location").fill("Blue binder");
  await page.getByLabel("Mid estimate").fill("125");
  await page.getByRole("button", { name: /Add Coin to My Collection/i }).click();
  await expectText(page, "1909 Lincoln Wheat Cent");

  await page.getByRole("link", { name: /Edit Coin/i }).click();
  await page.locator('textarea[name="notes"]').fill("Possible inherited coin. Ask Mom about the source.");
  await page.getByRole("button", { name: /Save Changes/i }).click();
  await expectText(page, "Ask Mom");

  await page.goto(`${url}#/collection`);
  await page.getByLabel("Search collection").fill("wheat");
  await expectText(page, "1909 Lincoln Wheat Cent");
  await page.getByLabel("Sort by").selectOption("year");
  await page.getByLabel("Show").selectOption("needsReview");
  await expectText(page, "No coins match");
  await page.getByLabel("Show").selectOption("all");
  await expectText(page, "1909 Lincoln Wheat Cent");

  await page.goto(`${url}#/scan`);
  const fixture = resolve(process.cwd(), "src/tests/fixtures-coin-front.svg");
  assert.equal(existsSync(fixture), true, "fixture image should exist");
  await page.locator('input[name="obverseImage"]').setInputFiles(fixture);
  await page.locator('input[name="reverseImage"]').setInputFiles(fixture);
  await page.getByLabel("Coin name").fill("1943 Steel Cent");
  await page.getByLabel("Country").fill("United States");
  await page.getByLabel("Denomination").fill("One cent");
  await page.getByLabel("Year").fill("1943");
  await page.getByRole("button", { name: /Add Coin to My Collection/i }).click();
  await expectText(page, "1943 Steel Cent");

  await page.getByLabel("Source name").fill("Manual auction note");
  await page.getByLabel("Observed price").fill("42");
  await page.getByRole("button", { name: /Add Comparable Sale/i }).click();
  await expectText(page, "Comparable Sales");
  await expectText(page, "$42");

  await page.goto(`${url}#/value`);
  await page.locator('input[name="sourceName1"]').fill("Auction A");
  await page.locator('input[name="observedPrice1"]').fill("10");
  await page.locator('input[name="sourceName2"]').fill("Auction B");
  await page.locator('input[name="observedPrice2"]').fill("20");
  await page.getByRole("button", { name: /Calculate Estimated Range/i }).click();
  await expectText(page, "$10");
  await expectText(page, "$15");
  await expectText(page, "$20");

  await page.goto(`${url}#/archive`);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Export JSON/i }).click()
  ]);
  assert.match(download.suggestedFilename(), /coinbuddy-export\.json/);
  await expectText(page, "JSON export ready");

  await page.goto(`${url}#/coin/${await getFirstCoinId(page, "1943 Steel Cent")}`);
  await page.getByRole("button", { name: /Delete Coin/i }).click();
  await expectText(page, "My Collection");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(hasHorizontalOverflow, false, "mobile viewport should not have page-level horizontal overflow");

  console.log("Browser workflow test passed.");
} finally {
  await browser.close();
  server.close();
}

async function getFirstCoinId(pageToUse, name) {
  return pageToUse.evaluate((coinName) => {
    const coins = JSON.parse(localStorage.getItem("coinbuddy.coins.v1") || "[]");
    const coin = coins.find((item) => item.name === coinName);
    return coin?.id || "";
  }, name);
}

async function expectText(pageToUse, text) {
  await pageToUse.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const runtimeModules = process.env.CODEX_NODE_MODULES
      || join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
    const requireTargets = [join(runtimeModules, "package.json"), findPnpmPackage(runtimeModules, "playwright")].filter(Boolean);
    let lastError;
    for (const target of requireTargets) {
      try {
        const requireFromRuntime = createRequire(target);
        return requireFromRuntime("playwright");
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}

function findPnpmPackage(runtimeModules, packageName) {
  const pnpmDirectory = join(runtimeModules, ".pnpm");
  if (!existsSync(pnpmDirectory)) {
    return "";
  }

  const match = readdirSync(pnpmDirectory).find((entry) => entry.startsWith(`${packageName}@`));
  return match ? join(pnpmDirectory, match, "node_modules", packageName, "package.json") : "";
}

function findBrowserLaunchOptions() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  const executablePath = candidates.find((candidate) => existsSync(candidate));
  return executablePath ? { executablePath } : {};
}
