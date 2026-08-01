/**
 * Capture documentation screenshots using Puppeteer.
 *
 * Prerequisites:
 *   1. npm run dev           — start dev server on port 3000
 *   2. npm run docs:screenshots  — registers a docs demo user automatically
 *
 * Output: public/docs/screenshots/*.png
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.DOCS_SCREENSHOT_BASE_URL ?? 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/docs/screenshots');
const VIEWPORT = { width: 1280, height: 800 };
const DEMO_EMAIL = process.env.DOCS_DEMO_EMAIL ?? 'docs-demo@invo.my';
const DEMO_PHONE = process.env.DOCS_DEMO_PHONE ?? '+601234567890';
const DEMO_PASSWORD = process.env.DOCS_DEMO_PASSWORD ?? 'password123';
const DEMO_NAME = process.env.DOCS_DEMO_NAME ?? 'Docs Demo User';

interface CaptureTarget {
  name: string;
  path: string;
  waitFor?: string;
  fullPage?: boolean;
  auth?: boolean;
}

const targets: CaptureTarget[] = [
  { name: 'signup', path: '/signup', auth: false },
  { name: 'login', path: '/login', auth: false },
  { name: 'dashboard', path: '/dashboard', auth: true, waitFor: 'h1, h2, [data-testid]' },
  { name: 'invoices-list', path: '/invoices', auth: true },
  { name: 'invoice-new', path: '/invoices/new', auth: true },
  { name: 'customers', path: '/customers', auth: true },
  { name: 'inventory', path: '/inventory', auth: true },
  { name: 'receipts', path: '/receipts', auth: true },
  { name: 'pos', path: '/pos', auth: true },
  { name: 'accounting-overview', path: '/accounting', auth: true },
  { name: 'accounting-transactions', path: '/accounting/transactions', auth: true },
  { name: 'settings', path: '/settings', auth: true },
];

async function ensureDemoUser(page: Page): Promise<boolean> {
  // Register demo user (ignore if already exists)
  await page.evaluate(
    async (url, name, email, phone, password) => {
      await fetch(`${url}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phoneNumber: phone, password }),
        credentials: 'include',
      });
    },
    BASE_URL,
    DEMO_NAME,
    DEMO_EMAIL,
    DEMO_PHONE,
    DEMO_PASSWORD
  );

  // Login via phone + password API
  const loggedIn = await page.evaluate(
    async (url, phone, password) => {
      const res = await fetch(`${url}/api/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, password }),
        credentials: 'include',
      });
      return res.ok;
    },
    BASE_URL,
    DEMO_PHONE,
    DEMO_PASSWORD
  );

  return loggedIn;
}

async function login(page: Page): Promise<boolean> {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  return ensureDemoUser(page);
}

async function capture(page: Page, target: CaptureTarget): Promise<boolean> {
  const url = `${BASE_URL}${target.path}`;
  console.log(`  Capturing ${target.name} → ${url}`);

  try {
    await page.setViewport(VIEWPORT);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    if (target.waitFor) {
      await page.waitForSelector(target.waitFor, { timeout: 10000 }).catch(() => {});
    }

    // Allow animations and data fetching to settle
    await new Promise((r) => setTimeout(r, 2000));

    const outputPath = path.join(OUTPUT_DIR, `${target.name}.png`);
    await page.screenshot({
      path: outputPath,
      fullPage: target.fullPage ?? false,
      type: 'png',
    });

    console.log(`  ✓ Saved ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed ${target.name}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUTPUT_DIR}\n`);

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Login once for authenticated pages
    console.log('Logging in with demo account…');
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.warn('Warning: Login may have failed. Auth-required screenshots might redirect to login.');
    } else {
      console.log('Login successful.\n');
    }

    const publicTargets = targets.filter((t) => !t.auth);
    const authTargets = targets.filter((t) => t.auth);

    let failed = 0;

    console.log('Public pages:');
    for (const target of publicTargets) {
      if (!(await capture(page, target))) failed++;
    }

    if (loggedIn) {
      console.log('\nAuthenticated pages:');
      for (const target of authTargets) {
        if (!(await capture(page, target))) failed++;
      }
    } else {
      console.log('\nSkipping authenticated pages (login failed).');
      console.log('Ensure the dev server is running.');
    }

    if (failed > 0) {
      console.warn(`\n${failed} screenshot(s) failed. Re-run after fixing issues.`);
    }
    console.log('\nDone!');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    process.exit(1);
  } finally {
    await browser?.close();
  }
}

main();
