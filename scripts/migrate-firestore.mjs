/**
 * Copy Firestore from a temporary / legacy source project into this repo’s
 * destination project.
 *
 * **Source (all in this file)**
 * - Paste the source Web app SDK object into `SOURCE_FIREBASE_CONFIG` below
 *   (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId;
 *   measurementId is optional).
 * - If source rules require sign-in to read, set `SOURCE_AUTH_EMAIL` and
 *   `SOURCE_AUTH_PASSWORD` below; otherwise leave them `null` (e.g. rules
 *   temporarily allow public read).
 *
 * **Destination**
 * - Uses `VITE_FIREBASE_*` from `.env` (same as `src/services/firebase.js`).
 * - If destination rules require an admin to write, set
 *   `MIGRATION_DEST_EMAIL` / `MIGRATION_DEST_PASSWORD` in `.env`, or
 *   temporarily open rules for the migration.
 *
 * After migration, remove secrets from this file or delete the script if you
 * no longer need it.
 *
 * Usage:
 *   node scripts/migrate-firestore.mjs
 *   node scripts/migrate-firestore.mjs events sermons
 *   MIGRATION_COLLECTIONS=events,sermons node scripts/migrate-firestore.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp, deleteApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/** Load `.env` into `process.env` (does not override existing vars). */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(join(rootDir, '.env'));

// ---------------------------------------------------------------------------
// Source project — entire Web SDK snippet from the *source* Firebase project.
// Console → Project settings → Your apps → Web app → `firebaseConfig` object.
// Must differ from `VITE_FIREBASE_PROJECT_ID` in `.env` unless you really mean
// to re-copy inside the same project.

// ---------------------------------------------------------------------------
const SOURCE_FIREBASE_CONFIG = {
  apiKey: "",
  
};

/** Set only if source Firestore rules require an authenticated user to read. */
const SOURCE_AUTH_EMAIL = null;
const SOURCE_AUTH_PASSWORD = null;

const DEFAULT_COLLECTIONS = [
  'users',
  'events',
  'sermons',
  'contactMessages',
  'prayerRequests',
  'churchProfileUpdates',
];

function loadDestFirebaseConfig() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing env vars in .env: ${missing.join(', ')}`,
    );
  }
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

function parseCollections() {
  const fromEnv = process.env.MIGRATION_COLLECTIONS?.trim();
  if (fromEnv) {
    return fromEnv.split(',').map((c) => c.trim()).filter(Boolean);
  }
  const argv = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (argv.length) return argv;
  return DEFAULT_COLLECTIONS;
}

function assertSourceConfigReplaced() {
  const placeholder = SOURCE_FIREBASE_CONFIG.apiKey?.includes('REPLACE');
  if (placeholder) {
    throw new Error(
      'Edit scripts/migrate-firestore.mjs and set SOURCE_FIREBASE_CONFIG ' +
        'to your source project Web config (replace all REPLACE_* values).',
    );
  }
}

function stripUndefined(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

async function copyCollection(sourceDb, destDb, name) {
  let snap;
  try {
    snap = await getDocs(collection(sourceDb, name));
  } catch (err) {
    const code = err?.code ?? err?.message;
    if (code === 'permission-denied' || String(code).includes('permission')) {
      console.log(
        `  ${name}: permission denied — open source read rules temporarily, or ` +
          `set SOURCE_AUTH_EMAIL / SOURCE_AUTH_PASSWORD in migrate-firestore.mjs`,
      );
      return 0;
    }
    throw err;
  }
  if (snap.empty) {
    console.log(`  ${name}: 0 documents (none readable, or collection empty)`);
    return 0;
  }

  let written = 0;
  const docs = snap.docs;
  const batchSize = 400;

  for (let i = 0; i < docs.length; i += batchSize) {
    const chunk = docs.slice(i, i + batchSize);
    const batch = writeBatch(destDb);
    for (const d of chunk) {
      batch.set(doc(destDb, name, d.id), stripUndefined(d.data()));
    }
    await batch.commit();
    written += chunk.length;
  }

  console.log(`  ${name}: copied ${written} document(s)`);
  return written;
}

async function main() {
  assertSourceConfigReplaced();

  const destConfig = loadDestFirebaseConfig();
  const collections = parseCollections();

  console.log(
    `Source project: ${SOURCE_FIREBASE_CONFIG.projectId} → ` +
      `destination: ${destConfig.projectId}`,
  );
  console.log(`Collections: ${collections.join(', ')}\n`);

  if (SOURCE_FIREBASE_CONFIG.projectId === destConfig.projectId) {
    console.warn(
      'Warning: source and destination projectId are identical. You are not ' +
        'importing from a different project — put the *old* project Web config ' +
        'in SOURCE_FIREBASE_CONFIG at the top of this script.\n',
    );
  }

  const sourceApp = initializeApp(SOURCE_FIREBASE_CONFIG, 'migration-source');
  const destApp = initializeApp(destConfig, 'migration-dest');

  const sourceDb = getFirestore(sourceApp);
  const destDb = getFirestore(destApp);

  if (SOURCE_AUTH_EMAIL && SOURCE_AUTH_PASSWORD) {
    const sourceAuth = getAuth(sourceApp);
    await signInWithEmailAndPassword(
      sourceAuth,
      SOURCE_AUTH_EMAIL,
      SOURCE_AUTH_PASSWORD,
    );
    console.log('Signed in to source project for reads.\n');
  }

  const email = process.env.MIGRATION_DEST_EMAIL;
  const password = process.env.MIGRATION_DEST_PASSWORD;
  if (email && password) {
    const destAuth = getAuth(destApp);
    await signInWithEmailAndPassword(destAuth, email, password);
    console.log('Signed in to destination project for writes.\n');
  } else {
    console.warn(
      'No MIGRATION_DEST_EMAIL / MIGRATION_DEST_PASSWORD — writes may fail ' +
        'if rules require admin.\n',
    );
  }

  let total = 0;
  for (const name of collections) {
    total += await copyCollection(sourceDb, destDb, name);
  }

  console.log(`\nDone. Total documents written: ${total}`);

  await deleteApp(sourceApp);
  await deleteApp(destApp);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
