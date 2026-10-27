/**
 * scripts/fetchGovSchemes.mjs
 *
 * Safe Open Data Ingestion Script for Saathi Project (Phase A)
 * 
 * Purpose:
 * - Safely fetches scheme records from the official Open Government Data (data.gov.in) API
 *   only when explicitly supplied with a valid API key and a confirmed dataset resource ID.
 * - Parses whatever fields the official dataset actually provides without guessing or hallucinating.
 * - Never touches src/data/schemes.ts or Firestore.
 * - Saves output to data/staged-schemes.json with metadata for human review.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Read environment variables directly or from local .env / .env.local file if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.join(projectRoot, envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            const key = k.trim();
            const val = v.join('=').trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`[Warning] Could not parse ${envFile}:`, err.message);
      }
    }
  }
}

loadEnv();

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || process.env.VITE_DATA_GOV_API_KEY;
const DATASET_RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID || process.argv[2];

// Beginner-friendly guidance when missing credentials or resource ID
if (!DATA_GOV_API_KEY || !DATASET_RESOURCE_ID) {
  console.log(`
========================================================================
Saathi — Official Indian Government Scheme Ingestion Utility (Phase A)
========================================================================

Missing configuration. To run this script safely without exposing secrets:

1. How to get a free data.gov.in API Key:
   - Go to: https://data.gov.in
   - Register or log in with your email (100% free, no credit card required).
   - In your user profile dashboard, copy your 40-character "API Key".

2. How to find a valid Dataset Resource ID:
   - Search for schemes on data.gov.in (e.g. "Central Sector Schemes", "Ministry of Agriculture Schemes").
   - Open the chosen dataset page and inspect the "API" tab or the URL.
   - The Resource ID is a 36-character UUID (e.g. "6176ee09-3d56-4a3b-8115-239857b150f8").

3. How to run:
   Add your key and chosen resource ID to your local .env or .env.local file:
     DATA_GOV_API_KEY=your_40_char_api_key_here
     DATA_GOV_RESOURCE_ID=your_dataset_resource_id_here

   Then execute:
     npm run fetch-schemes

   Or pass the resource ID as a command-line argument:
     node scripts/fetchGovSchemes.mjs <resource_id>

Note: 
- No network requests were made because required parameters are not provided.
- Your existing application code, database, and local dataset remain untouched.
========================================================================
`);
  process.exit(0);
}

// Ensure the data directory exists
const outputDir = path.join(projectRoot, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const stagedFilePath = path.join(outputDir, 'staged-schemes.json');

async function fetchFromDataGov() {
  console.log(`[Info] Contacting data.gov.in for resource ID: ${DATASET_RESOURCE_ID}...`);
  
  const queryUrl = new URL(`https://api.data.gov.in/resource/${DATASET_RESOURCE_ID}`);
  queryUrl.searchParams.set('api-key', DATA_GOV_API_KEY);
  queryUrl.searchParams.set('format', 'json');
  queryUrl.searchParams.set('limit', '50');

  let response;
  try {
    response = await fetch(queryUrl.toString());
  } catch (netErr) {
    console.error('[Error] Network failure while contacting data.gov.in:', netErr.message);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`[Error] data.gov.in responded with HTTP status ${response.status} (${response.statusText}).`);
    if (response.status === 403 || response.status === 401) {
      console.error('Please verify that your DATA_GOV_API_KEY is active and valid.');
    } else if (response.status === 404) {
      console.error('Please verify that your DATA_GOV_RESOURCE_ID matches an existing dataset.');
    }
    process.exit(1);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    console.error('[Error] Failed to parse API response as JSON:', parseErr.message);
    process.exit(1);
  }

  if (!data || !Array.isArray(data.records)) {
    console.warn('[Warning] Response did not contain a "records" array. Full response keys:', Object.keys(data || {}));
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  console.log(`[Info] Retrieved ${data.records.length} raw records from dataset: "${data.title || DATASET_RESOURCE_ID}".`);

  const timestamp = new Date().toISOString();
  const stagedRecords = [];

  for (let i = 0; i < data.records.length; i++) {
    const raw = data.records[i];
    
    // Find fields dynamically without assuming rigid column headers
    const findField = (candidates) => {
      for (const k of Object.keys(raw)) {
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const c of candidates) {
          if (normalized === c.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            return String(raw[k] || '').trim();
          }
        }
      }
      return '';
    };

    const schemeName = findField(['scheme_name', 'schemename', 'name_of_the_scheme', 'scheme', 'title', 'project_name']);
    const ministry = findField(['ministry', 'department', 'ministry_department', 'nodal_ministry', 'agency']);
    const sector = findField(['sector', 'category', 'broad_sector']);
    const description = findField(['description', 'objective', 'overview', 'details', 'about']);
    const urlField = findField(['website', 'url', 'official_url', 'link', 'portal']);

    if (!schemeName) {
      // Skip empty or header rows
      continue;
    }

    // Slugify id
    const cleanSlug = schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    const generatedId = `staged-${cleanSlug || 'sch-' + (i + 1)}`;

    // Staged scheme record
    const stagedRecord = {
      id: generatedId,
      name: schemeName,
      shortDescription: description || `Government initiative under ${ministry || 'Government of India'}.`,
      detailedOverview: description || '',
      benefits: '', // Left blank if not provided by open dataset
      eligibility: '', // Left blank if not provided by open dataset
      documents: '', // Left blank if not provided by open dataset
      applicationProcess: '', // Left blank if not provided by open dataset
      classification: 'Central',
      category: sector || 'General Welfare',
      officialUrl: urlField || 'https://www.india.gov.in',
      source: ministry ? `${ministry}, Government of India (via data.gov.in)` : 'Open Government Data Platform India (data.gov.in)',
      lastVerified: timestamp.split('T')[0],
      // Staged records are NEVER automatically marked 'verified'
      verificationStatus: 'unverified',
      _reviewMetadata: {
        retrievedAt: timestamp,
        sourceDatasetId: DATASET_RESOURCE_ID,
        sourceDatasetTitle: data.title || '',
        rawFields: raw,
        needsManualReview: true,
        missingFields: [
          ...(!description ? ['detailedOverview'] : []),
          'benefits',
          'eligibility',
          'documents',
          'applicationProcess',
          ...(!urlField ? ['officialUrl'] : [])
        ]
      }
    };

    stagedRecords.push(stagedRecord);
  }

  // Load existing staged records if file exists to prevent accidental wipe
  let finalStaged = stagedRecords;
  if (fs.existsSync(stagedFilePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(stagedFilePath, 'utf8'));
      if (Array.isArray(existing)) {
        const existingMap = new Map(existing.map((item) => [item.id, item]));
        for (const newRec of stagedRecords) {
          existingMap.set(newRec.id, newRec);
        }
        finalStaged = Array.from(existingMap.values());
      }
    } catch (readErr) {
      console.warn('[Warning] Could not parse existing staged-schemes.json, creating a new file.');
    }
  }

  fs.writeFileSync(stagedFilePath, JSON.stringify(finalStaged, null, 2), 'utf8');

  console.log(`
========================================================================
[Success] Staged ${stagedRecords.length} records into:
  ${stagedFilePath}

Review Summary:
- Total staged records in file: ${finalStaged.length}
- All records marked as: "verificationStatus": "unverified"
- Manual review needed: Check eligibility, documents, benefits, and officialUrl.
- Your app's active catalog (src/data/schemes.ts) and Firestore are UNTOUCHED.
========================================================================
`);
}

fetchFromDataGov();
