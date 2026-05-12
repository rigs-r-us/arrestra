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

const API_BASE = process.env.ARRESTRA_API_BASE || 'http://localhost:3000';
const API_KEY = process.env.ARRESTRA_API_KEY || '';
const TOPICS_API_URL =
  'https://topics.txcourts.gov/BailPublic/GetAllBailForms';

const TOPICS_LIMIT = Number(process.env.TOPICS_LIMIT || 25);

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
  charge?: string | null;
  chargeSeverity?: string | null;
  bondAmount?: number | null;
  bondType?: string | null;
  custodyStatus?: string | null;
  notes?: string | null;
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
    sourceUrl: `https://topics.txcourts.gov/BailPublic/Details/${bailFormId}`,
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
    charge: offense,
    chargeSeverity: inferChargeSeverity(offense),
    bondAmount: null,
    bondType: null,
    custodyStatus: null,
    notes: location,
  };
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

  const leads = limitedRows.map(mapTopicsRow);

  for (const lead of leads) {
    try {
      await ingestLead(lead);
    } catch (err: any) {
      console.error(
        'Failed to ingest lead:',
        lead.sourceId || lead.caseNumber || lead.fullName,
        err?.message ?? err,
      );
    }
  }

  console.log('Done scraping & ingesting TOPICs Travis bail forms.');
}

main().catch((err) => {
  console.error('Fatal scraper error:', err);
  process.exit(1);
});