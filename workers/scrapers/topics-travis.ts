/**
 * Scraper for TOPICs Travis County bail forms → Arrestra /api/leads/ingest
 *
 * Run locally:
 *   ARRESTRA_API_BASE=http://localhost:3000 \
 *   ARRESTRA_API_KEY=demo-api-key \
 *   npm run scrape:topics:travis
 *
 * Optional:
 *   TOPICS_LIMIT=25 npm run scrape:topics:travis
 */

import { load } from 'cheerio';

const API_BASE = process.env.ARRESTRA_API_BASE || 'http://localhost:3000';
const API_KEY = process.env.ARRESTRA_API_KEY || '';
const TOPICS_API_URL =
  'https://topics.txcourts.gov/BailPublic/GetAllBailForms';

const TOPICS_LIMIT = Number(process.env.TOPICS_LIMIT || 25);

// Politeness delay between per-lead detail-page fetches against the court site.
const DETAIL_FETCH_DELAY_MS = 300;

type TopicsRow = [string, string, string, string, string];

type IngestPayload = {
  source?: string;
  sourceId?: string | null;
  sourceUrl?: string | null;
  rawData?: unknown;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  county?: string | null;
  caseNumber?: string | null;
  arrestDate?: string | null;
  bookingDate?: string | null;
  magistrate?: string | null;
  magistrationDate?: string | null;
  charge?: string | null;
  chargeSeverity?: string | null;
  bondAmount?: number | null;
  bondType?: string | null;
  custodyStatus?: string | null;
  notes?: string | null;
};

type DetailFields = {
  arrestDate: string | null;
  magistrate: string | null;
  magistrationDate: string | null;
  bondAmount: number | null;
  bondType: string | null;
};

function clean(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || null;
}

function normalizeName(value?: string | null) {
  return clean(value?.replace(/^,/, ''));
}

function splitName(fullName: string | null) {
  if (!fullName) {
    return { firstName: null, lastName: null };
  }

  if (fullName.includes(',')) {
    const [lastName, firstName] = fullName.split(',').map(clean);
    return { firstName, lastName };
  }

  const tokens = fullName.split(' ').filter(Boolean);

  return {
    firstName: tokens[0] ?? null,
    lastName: tokens.length > 1 ? tokens.slice(1).join(' ') : null,
  };
}

function inferChargeSeverity(offense?: string | null) {
  const text = offense?.toUpperCase() || '';

  if (
    text.includes(' FELONY') ||
    text.includes(' FEL ') ||
    text.includes('FELON') ||
    text.includes('F1') ||
    text.includes('F2') ||
    text.includes('F3') ||
    text.includes('SJF') ||
    text.includes('STATE JAIL')
  ) {
    return 'Felony';
  }

  if (
    text.includes(' MISDEMEANOR') ||
    text.includes('CLASS A') ||
    text.includes('CLASS B') ||
    text.includes('CLASS C') ||
    text.includes(' MA ') ||
    text.includes(' MB ') ||
    text.includes(' MC ')
  ) {
    return 'Misdemeanor';
  }

  return null;
}

function mapTopicsRow(row: TopicsRow): IngestPayload {
  const [rawName, rawCauseNumber, rawLocation, rawOffense, bailFormId] = row;

  const fullName = normalizeName(rawName);
  const { firstName, lastName } = splitName(fullName);
  const offense = clean(rawOffense);
  const location = clean(rawLocation);

  return {
    source: 'topics.travis',
    sourceId: bailFormId,
    sourceUrl: `https://topics.txcourts.gov/BailPublic/BailPublic/${bailFormId}`,
    rawData: {
      row,
      name: rawName,
      causeNumber: rawCauseNumber,
      magistrationLocation: rawLocation,
      offense: rawOffense,
      bailFormId,
    },
    firstName,
    lastName,
    fullName,
    phone: null,
    email: null,
    county: 'Travis',
    caseNumber: clean(rawCauseNumber),
    arrestDate: null,
    bookingDate: null,
    magistrate: null,
    magistrationDate: null,
    charge: offense,
    chargeSeverity: inferChargeSeverity(offense),
    bondAmount: null,
    bondType: null,
    custodyStatus: null,
    notes: location,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The top "Arrest"/"Magistration" section renders as <th class="po-d">Label :</th><td>Value</td>
// rows. Labels vary in whitespace/colon placement across fields, so compare normalized.
function normalizeLabel(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*$/, '')
    .trim()
    .toLowerCase();
}

// Some date/time fields render as two adjacent spans, e.g. "8/9/2024 9:37:00 AM" + "CDT",
// which td.text() concatenates. Strip a trailing zone abbreviation so `new Date(...)` (used
// downstream by the ingest route) parses the timestamp instead of choking on/misreading it.
function stripTrailingTimezone(text: string) {
  return text.replace(/(AM|PM)\s+[A-Z]{2,5}$/, '$1').trim();
}

function parseBailAmount(text: string): number | null {
  const amount = Number(text.replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) && text.trim() !== '' ? Math.round(amount) : null;
}

// The offense/bail-type/bail-amount/cause-number section isn't a semantic table — it's a
// Bootstrap grid: one header ".po-bottom" block (four <h4> column titles), followed by one
// ".po-bottom" block per offense (four positional <div> columns), and a final ".po-bottom"
// block with the "Bail Conditions?" line. A bail form can list multiple offenses/amounts.
function parseOffenseRows($: ReturnType<typeof load>) {
  const rows: { offense: string | null; bailType: string | null; bailAmount: number | null }[] = [];

  $('.po-bottom').each((_, block) => {
    const $block = $(block);
    if ($block.find('h4').length > 0 || $block.find('h5').length > 0) {
      return;
    }

    const cols = $block.find('> .row > div');
    if (cols.length < 3) {
      return;
    }

    const offense = clean($(cols[0]).text());
    const bailType = clean($(cols[1]).text());
    const bailAmountText = clean($(cols[2]).text());

    if (!offense && !bailAmountText) {
      return;
    }

    rows.push({
      offense,
      bailType,
      bailAmount: bailAmountText ? parseBailAmount(bailAmountText) : null,
    });
  });

  return rows;
}

function fieldValue($: ReturnType<typeof load>, label: string) {
  const target = normalizeLabel(label);
  let value: string | null = null;

  $('th.po-d').each((_, el) => {
    if (normalizeLabel($(el).text()) === target) {
      value = clean($(el).next('td').text());
    }
  });

  return value;
}

async function fetchBailFormDetail(bailFormId: string): Promise<DetailFields | null> {
  const url = `https://topics.txcourts.gov/BailPublic/BailPublic/${bailFormId}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`Detail page fetch failed for ${bailFormId}: ${res.status} ${res.statusText}`);
      return null;
    }

    const html = await res.text();
    const $ = load(html);

    const arrestDateRaw = fieldValue($, 'Arrest Date');
    const magistrationDateRaw = fieldValue($, 'Magistration Date');
    const offenseRows = parseOffenseRows($);

    const bondAmount =
      offenseRows.reduce((sum, row) => sum + (row.bailAmount ?? 0), 0) || null;
    const bondType = offenseRows.find((row) => row.bailType)?.bailType ?? null;

    return {
      arrestDate: arrestDateRaw ? stripTrailingTimezone(arrestDateRaw) : null,
      magistrate: fieldValue($, 'Magistrate'),
      magistrationDate: magistrationDateRaw ? stripTrailingTimezone(magistrationDateRaw) : null,
      bondAmount,
      bondType,
    };
  } catch (err: any) {
    console.warn(`Failed to parse detail page for ${bailFormId}:`, err?.message ?? err);
    return null;
  }
}

async function fetchTopicsTravisForms(): Promise<TopicsRow[]> {
  console.log('Fetching TOPICs Travis bail forms:', TOPICS_API_URL);

  const res = await fetch(TOPICS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      Name: '',
      CauseNumber: '',
      MagistrationLocation: 'Travis',
      Offense: '',
    }),
  });

  if (!res.ok) {
    throw new Error(`TOPICs request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!Array.isArray(json.data)) {
    throw new Error('TOPICs response did not include a data array');
  }

  return json.data as TopicsRow[];
}

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

async function main() {
  if (!API_KEY) {
    throw new Error('ARRESTRA_API_KEY is not set – cannot ingest leads');
  }

  const rows = await fetchTopicsTravisForms();
  console.log(`Fetched ${rows.length} TOPICs Travis row(s).`);

  const limitedRows = rows.slice(0, TOPICS_LIMIT);
  console.log(`Ingesting first ${limitedRows.length} row(s).`);

  for (const row of limitedRows) {
    const lead = mapTopicsRow(row);
    const bailFormId = row[4];

    const detail = await fetchBailFormDetail(bailFormId);
    if (detail) {
      lead.arrestDate = detail.arrestDate;
      lead.magistrate = detail.magistrate;
      lead.magistrationDate = detail.magistrationDate;
      lead.bondAmount = detail.bondAmount;
      lead.bondType = detail.bondType;
    }

    try {
      await ingestLead(lead);
    } catch (err: any) {
      console.error(
        'Failed to ingest lead:',
        lead.sourceId || lead.caseNumber || lead.fullName,
        err?.message ?? err,
      );
    }

    await delay(DETAIL_FETCH_DELAY_MS);
  }

  console.log('Done scraping & ingesting TOPICs Travis bail forms.');
}

main().catch((err) => {
  console.error('Fatal scraper error:', err);
  process.exit(1);
});