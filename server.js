/**
 * MORGAN_Bacc — Web Service (Render ready)
 * ---------------------------------------
 * Routes attendues par le frontend :
 *   POST /api/redeem-key          { hash }
 *   GET  /api/history?limit=150&channel=...
 *   GET  /api/latest-game?channel=...
 *
 * Les données Telegram sont pour l'instant MOCKÉES
 * (format réel compatible avec le frontend).
 * Branche ta vraie source Telegram dans les fonctions
 * fetchTelegramHistory() et fetchLatestTelegramGame().
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Stockage simple des clés déjà utilisées ─────────────
// En production : remplace par Redis / Postgres / fichier persistant.
const USED_KEYS_FILE = path.join(__dirname, 'data', 'used-keys.json');

function ensureDataDir() {
  const dir = path.dirname(USED_KEYS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadUsedKeys() {
  try {
    ensureDataDir();
    if (!fs.existsSync(USED_KEYS_FILE)) return new Set();
    const raw = fs.readFileSync(USED_KEYS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveUsedKeys(set) {
  try {
    ensureDataDir();
    fs.writeFileSync(USED_KEYS_FILE, JSON.stringify([...set], null, 2));
  } catch (e) {
    console.error('Impossible de sauvegarder used-keys:', e.message);
  }
}

let usedKeys = loadUsedKeys();

// ── MOCK Telegram (remplace par vraie source) ───────────
// Format attendu par le frontend :
// {
//   game_number: 1283,
//   normalized: "#N1283. ✅8(7♠️A♣️) - 6(6♦️Q♣️) #T14 🔵 #R",
//   raw_text: "...",
//   message_id: 12345,
//   published_at: "2026-11-03T14:20:00Z",
//   channel_name: "statistika_baccara",
//   source_url: "https://t.me/statistika_baccara"
// }

function makeMockGame(n, p1Cards, p2Cards, total = 14) {
  const normalized = `#N${n}. ✅${p1Cards.length === 3 ? 3 : 2}(${p1Cards}) - ${p2Cards.length === 3 ? 3 : 2}(${p2Cards}) #T${total} 🔵 #R`;
  return {
    game_number: n,
    normalized,
    raw_text: normalized,
    message_id: 100000 + n,
    published_at: new Date(Date.now() - (1500 - n) * 60000).toISOString(),
    channel_name: 'statistika_baccara',
    source_url: 'https://t.me/statistika_baccara'
  };
}

// Quelques jeux mock réalistes (format 2-2 / 2-3 / 3-3)
const MOCK_GAMES = [
  makeMockGame(1280, '7♠️A♣️', '6♦️Q♣️', 13),
  makeMockGame(1281, 'K♥️9♠️', '5♣️3♦️', 17),
  makeMockGame(1282, '2♣️8♥️J♠️', 'A♦️4♠️', 15),          // 3-2
  makeMockGame(1283, '10♠️Q♣️', '7♥️2♦️K♣️', 19),         // 2-3
  makeMockGame(1284, 'A♠️3♥️5♣️', '9♦️J♠️K♥️', 28),       // 3-3 RÉVÉLATION
  makeMockGame(1285, '4♣️6♠️', '8♥️2♣️', 20),
  makeMockGame(1286, 'K♦️7♠️', 'A♣️5♥️9♠️', 22),
  makeMockGame(1287, '3♥️J♣️', 'Q♠️4♦️', 17),
  makeMockGame(1288, '9♠️2♥️8♣️', '6♦️A♠️3♥️', 28),       // 3-3
  makeMockGame(1289, '5♣️K♥️', '10♠️7♦️', 22),
  makeMockGame(1290, 'A♦️4♣️', '2♠️9♥️J♣️', 16),
  makeMockGame(1291, '8♠️6♥️', '3♣️Q♦️', 17),
  makeMockGame(1292, 'J♠️5♦️2♣️', 'K♥️7♠️', 24),
  makeMockGame(1293, '4♥️A♠️', '9♣️3♦️', 16),
  makeMockGame(1294, '7♣️10♠️Q♥️', '2♦️5♠️8♣️', 32),     // 3-3
  makeMockGame(1295, 'K♠️3♥️', '6♣️A♦️', 20),
  makeMockGame(1296, '2♠️9♣️', 'J♥️4♠️', 15),
  makeMockGame(1297, '5♥️8♦️', 'Q♣️7♠️', 20),
  makeMockGame(1298, 'A♣️K♠️3♥️', '10♦️2♣️', 16),
  makeMockGame(1299, '6♠️4♥️', '9♣️J♦️', 19),
];

/**
 * À REMPLACER : récupère les N derniers jeux réels du canal Telegram.
 * Options courantes :
 *  - Bot Telegram + getUpdates / channel posts
 *  - Bibliothèque MTProto (gramjs, telethon via microservice)
 *  - Scraping autorisé de t.me/s/statistika_baccara (fragile)
 */
async function fetchTelegramHistory(limit = 150, channel = 'statistika_baccara') {
  // MOCK — retourne les jeux les plus récents
  const games = MOCK_GAMES.slice(-Math.min(limit, MOCK_GAMES.length));
  return { games, channel, source: 'mock' };
}

/**
 * À REMPLACER : récupère le dernier jeu publié.
 */
async function fetchLatestTelegramGame(channel = 'statistika_baccara') {
  const last = MOCK_GAMES[MOCK_GAMES.length - 1];
  return { ...last, source: 'mock' };
}

// ── Routes API ──────────────────────────────────────────

/**
 * POST /api/redeem-key
 * Body: { hash: "sha256..." }
 * Réponses :
 *   { ok: true }
 *   { error: "used" }
 *   { error: "reject" }
 */
app.post('/api/redeem-key', (req, res) => {
  const hash = (req.body && req.body.hash) ? String(req.body.hash).trim() : '';
  if (!hash || hash.length < 8) {
    return res.status(400).json({ ok: false, error: 'reject' });
  }

  if (usedKeys.has(hash)) {
    return res.json({ ok: false, error: 'used' });
  }

  usedKeys.add(hash);
  saveUsedKeys(usedKeys);

  console.log(`[KEY] redeemed ${hash.slice(0, 12)}…  (total used: ${usedKeys.size})`);
  return res.json({ ok: true });
});

/**
 * GET /api/history?limit=150&channel=statistika_baccara
 */
app.get('/api/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 150, 300);
    const channel = (req.query.channel || 'statistika_baccara').replace(/[^a-zA-Z0-9_]/g, '');
    const data = await fetchTelegramHistory(limit, channel);
    res.json(data);
  } catch (e) {
    console.error('[history]', e);
    res.status(500).json({ error: e.message || 'history_failed' });
  }
});

/**
 * GET /api/latest-game?channel=statistika_baccara
 */
app.get('/api/latest-game', async (req, res) => {
  try {
    const channel = (req.query.channel || 'statistika_baccara').replace(/[^a-zA-Z0-9_]/g, '');
    const data = await fetchLatestTelegramGame(channel);
    if (!data || !data.normalized) {
      return res.status(404).json({ error: 'Aucune donnée exploitable trouvée' });
    }
    res.json(data);
  } catch (e) {
    console.error('[latest-game]', e);
    res.status(500).json({ error: e.message || 'latest_failed' });
  }
});

// Santé (utile pour Render)
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// SPA fallback : tout le reste → index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Démarrage ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`MORGAN_Bacc running on port ${PORT}`);
  console.log(`Clés déjà utilisées en mémoire : ${usedKeys.size}`);
});
