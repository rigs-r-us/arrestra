/**
 * Scraper for TOPICs (Travis County) → Arrestra /api/leads/ingest
 *
 * Run with:
 *   ARRESTRA_API_BASE=http://localhost:3000 \
 *   ARRESTRA_API_KEY=your-tenant-api-key \
 *   npx ts-node workers/scrapers/topics-travis.ts
 *
 * In prod (GitHub Actions / Lambda), set:
 *   ARRESTRA_API_BASE=https://app.arrestra.com
 *   ARRESTRA_API_KEY=<<secret>>
 */

import * as cheerio from 'cheerio';

const API_BASE = process.env.ARRESTRA_API_BASE || 'http://localhost:3000';
const API_KEY = process.env.ARRESTRA_API_KEY || '';
// TODO: set this to the actual Travis County TOPICs URL you use:
const TOPICS_TRAVIS_URL =
  process.env.TOPICS_TRAVIS_URL ||
  'https://topics.txcourts.gov/BailPublic/'; // adjust as needed

type IngestPayload = {
  source?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  county?: string | null;
  caseNumber?: string | null;
  arrestDate?: string | null;
  charge?: string | null;
  bondAmount?: number | null;
  notes?: string | null;
};

async function ingestLead(payload: IngestPayload) {
  if (!API_KEY) {
    throw new Error('ARRESTRA_API_KEY is not set');
  }

  const res = await fetch(`${API_BASE}/api/leads/ingest`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      source: 'topics.travis',
      ...payload,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ingest failed: ${res.status} ${res.statusText} – ${text}`);
  }

  const json = await res.json();
  console.log('Ingested lead:', json);
}

/**
 * Fetch the TOPICs HTML page.
 */
async function fetchTopicsHtml(): Promise<string> {
  console.log('Fetching TOPICs page:', TOPICS_TRAVIS_URL);
  const res = await fetch(TOPICS_TRAVIS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch TOPICs page: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

/**
 * Parse the HTML into a list of ingest-ready lead objects.
 * NOTE: You will need to tweak the selectors (`table`, `tr`, etc.)
 * to match the actual structure of the TOPICs site.
 */
function parseTopicsHtml(html: string): IngestPayload[] {
  const $ = cheerio.load(html);
  const leads: IngestPayload[] = [];

  // Example: suppose there is a table with rows of defendants.
  // Adjust selectors to match reality (table id, column order, etc.)
  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length === 0) return;

    // These are placeholders; map them to the real columns:
    const fullName = $(cells[0]).text().trim();      // e.g. "DOE, JOHN"
    const caseNumber = $(cells[1]).text().trim();    // e.g. "D-1-CR-25-123456"
    const county = $(cells[2]).text().trim() || 'Travis';
    const arrestDateRaw = $(cells[3]).text().trim(); // e.g. "12/10/2025"
    const charge = $(cells[4]).text().trim();
    const bondRaw = $(cells[5]).text().trim();       // e.g. "$5,000.00"

    // Naive name split "LAST, FIRST"
    let firstName: string | null = null;
    let lastName: string | null = null;
    if (fullName) {
      const parts = fullName.split(',');
      if (parts.length === 2) {
        lastName = parts[0].trim();
        firstName = parts[1].trim();
      } else {
        // Fallback if not "LAST, FIRST"
        const tokens = fullName.split(' ');
        firstName = tokens[0] ?? null;
        lastName = tokens.slice(1).join(' ') || null;
      }
    }

    // Parse bond amount
    let bondAmount: number | null = null;
    if (bondRaw) {
      const normalized = bondRaw.replace(/[^0-9]/g, '');
      if (normalized) {
        bondAmount = parseInt(normalized, 10);
      }
    }

    // Parse arrest date into ISO string if possible
    let arrestDate: string | null = null;
    if (arrestDateRaw) {
      const d = new Date(arrestDateRaw);
      if (!isNaN(d.getTime())) {
        arrestDate = d.toISOString();
      }
    }

    leads.push({
      source: 'topics.travis',
      firstName,
      lastName,
      phone: null,
      email: null,
      county,
      caseNumber: caseNumber || null,
      arrestDate,
      charge: charge || null,
      bondAmount,
      notes: null,
    });
  });

  console.log(`Parsed ${leads.length} lead(s) from TOPICs HTML`);
  return leads;
}

async function main() {
  if (!API_KEY) {
    throw new Error('ARRESTRA_API_KEY is not set – cannot ingest leads');
  }

  const html = await fetchTopicsHtml();
  const leads = parseTopicsHtml(html);

  for (const lead of leads) {
    try {
      await ingestLead(lead);
    } catch (err: any) {
      console.error('Failed to ingest lead:', lead.caseNumber, err?.message ?? err);
    }
  }

  console.log('Done scraping & ingesting TOPICs (Travis).');
}

// Run
main().catch((err) => {
  console.error('Fatal scraper error:', err);
  process.exit(1);
});
