/**
 * TinyHeroes — game.js  (v7 — Charakter-Auswahl)
 * ============================================================
 * Rundenbasiertes Karten-Kampfspiel: 3 spielbare Charaktere,
 * 5 Gegner-Wellen mit aufsteigender Schwierigkeit.
 *
 * Struktur:
 *   1. Charakter-Definitionen & Karten-Pools
 *   2. Gegner-Definitionen
 *   3. Spielzustand (Game State)
 *   4. Kampflogik
 *   5. UI-Rendering
 *   6. Event-Handler & Initialisierung
 * ============================================================
 */

/* ============================================================
   1. CHARAKTER-DEFINITIONEN & KARTEN-POOLS
   ============================================================ */

/**
 * Spielbare Charaktere mit eigenen Stats und Karten-Pools.
 * Jeder Charakter hat ein einzigartiges Deck.
 */
const HEROES = {
  magierin: {
    id: 'magierin',
    name: 'Willow',
    emoji: '🧙‍♀️',
    image: 'assets/heroes/GameIcon/willow.png',
    hp: 22,
    atk: 5,
    def: 2,
    cardPool: [
      { id: 'fireball',       label: '🔥 Feuerball',      type: 'attack',  desc: 'ATK − DEF Schaden',              atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 3 },
      { id: 'ice-shard',      label: '❄️ Eissplitter',     type: 'attack',  desc: '+1 Schaden',                     atkBonus: 1, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'arcane-bolt',    label: '✨ Arkaner Blitz',   type: 'attack',  desc: '+2 Schaden',                     atkBonus: 2, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'shield',         label: '🛡️ Schild',          type: 'defense', desc: 'Halbiert Schaden diese Runde',   atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0.5, cooldown: 0, count: 2 },
      { id: 'mirror',         label: '🪞 Spiegel',         type: 'special', desc: 'Reflektiert Angriff (ab W3)',    atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'healing-potion', label: '💚 Heiltrank',       type: 'defense', desc: 'Heilt 4 HP',                     atkBonus: 0, defBonus: 0, heal: 4, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'crossbow',       label: '🏹 Armbrust',        type: 'special', desc: '+4 Schaden, Cooldown 1',         atkBonus: 4, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 1, count: 1 },
    ],
  },

  fledermaus: {
    id: 'fledermaus',
    name: 'Shaddow',
    emoji: '🦇',
    image: 'assets/heroes/GameIcon/shaddow.png',
    hp: 18,
    atk: 6,
    def: 1,
    cardPool: [
      { id: 'bite',           label: '🦷 Biss',            type: 'attack',  desc: 'ATK − DEF Schaden',              atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 3 },
      { id: 'sonic-screech',  label: '🔊 Ultraschall',     type: 'attack',  desc: '+2 Schaden',                     atkBonus: 2, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'dive-strike',    label: '💨 Sturzflug',       type: 'attack',  desc: '+3 Schaden, Cooldown 1',         atkBonus: 3, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 1, count: 1 },
      { id: 'echolocation',   label: '📡 Echolot',         type: 'defense', desc: 'Halbiert Schaden diese Runde',   atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0.5, cooldown: 0, count: 2 },
      { id: 'blood-drain',    label: '🩸 Blutdrain',       type: 'special', desc: 'Heilt 3 HP & +1 Schaden',        atkBonus: 1, defBonus: 0, heal: 3, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'shadow-cloak',   label: '🌑 Schattenmantel',  type: 'defense', desc: '+3 DEF diese Runde',             atkBonus: 0, defBonus: 3, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'mirror',         label: '🪞 Spiegel',         type: 'special', desc: 'Reflektiert Angriff (ab W3)',    atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
    ],
  },

  goettin: {
    id: 'goettin',
    name: 'Morigin',
    emoji: '👸',
    image: 'assets/heroes/GameIcon/morigin.png',
    hp: 20,
    atk: 5,
    def: 3,
    cardPool: [
      { id: 'soul-strike',    label: '💀 Seelenschlag',    type: 'attack',  desc: 'ATK − DEF Schaden',              atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 3 },
      { id: 'curse',          label: '🌀 Fluch',           type: 'attack',  desc: '+1 Schaden',                     atkBonus: 1, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'death-bolt',     label: '☠️ Todesblitz',      type: 'attack',  desc: '+2 Schaden, Cooldown 1',         atkBonus: 2, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 1, count: 1 },
      { id: 'underworld-shield', label: '🌑 Unterwelt-Schild', type: 'defense', desc: 'Halbiert Schaden diese Runde', atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0.5, cooldown: 0, count: 2 },
      { id: 'soul-harvest',   label: '✨ Seelenernte',     type: 'special', desc: 'Heilt 5 HP',                     atkBonus: 0, defBonus: 0, heal: 5, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'mirror',         label: '🪞 Spiegel',         type: 'special', desc: 'Reflektiert Angriff (ab W3)',    atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
      { id: 'necrotic-wave',  label: '🌊 Nekrotische Welle', type: 'attack', desc: 'ATK − DEF Schaden',                   atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
    ],
  },
};

/** Aktuell gewählter Charakter (wird bei Auswahl gesetzt) */
let selectedHero = null;

/**
 * Erstellt ein gemischtes Deck aus dem Kartenpool des gewählten Helden.
 * @param {object[]} cardPool
 * @returns {object[]} Gemischtes Deck
 */
function buildDeck(cardPool) {
  const deck = [];
  cardPool.forEach(card => {
    for (let i = 0; i < card.count; i++) {
      deck.push({ ...card });
    }
  });
  return shuffle(deck);
}

/**
 * Fisher-Yates-Shuffle — in-place, gibt Array zurück.
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Zieht `n` Karten vom Deck. Wenn das Deck leer wird,
 * wird der Ablagestapel neu gemischt.
 * @param {object} deckState - { deck, discard }
 * @param {number} n
 * @returns {object[]} Gezogene Karten
 */
function drawCards(deckState, n) {
  const drawn = [];
  for (let i = 0; i < n; i++) {
    if (deckState.deck.length === 0) {
      deckState.deck = shuffle(deckState.discard);
      deckState.discard = [];
    }
    if (deckState.deck.length > 0) {
      drawn.push(deckState.deck.pop());
    }
  }
  return drawn;
}

/* ============================================================
   2. GEGNER-DEFINITIONEN
   ============================================================ */

/**
 * Gegner-Wellen: 5 einzigartige Gegner mit aufsteigender Schwierigkeit.
 * Jede Welle definiert Name, Emoji, Stats, Hintergrundbild und Aktionsmuster.
 *
 * Aktionstypen:
 *   0 = normal-attack     (normaler Angriff)
 *   1 = tail-whip         (Schwanzpeitsche, +1 ATK)
 *   2 = preparing-blast   (Vorbereitungsphase — kündigt Spezialangriff an)
 *   3 = water-blast       (Wasserstoß, +4 ATK)
 *   4 = scale-armor       (Schuppenpanzer, +3 DEF)
 *   5 = rest              (Ruhephase — kein Angriff)
 *   6 = fire-breath       (Feueratem, +3 ATK)
 *   7 = preparing-fire    (Vorbereitungsphase Feuer)
 *   8 = ice-breath        (Eisatem, +3 ATK)
 *   9 = preparing-ice     (Vorbereitungsphase Eis)
 *  10 = blizzard          (Blizzard, +5 ATK)
 *  11 = petrify-gaze      (Versteinernder Blick, +2 ATK + DEF-Debuff)
 *  12 = preparing-petrify (Vorbereitungsphase Versteinern)
 *  13 = inferno-charge    (Inferno-Angriff, +5 ATK)
 *  14 = preparing-inferno (Vorbereitungsphase Inferno)
 */
const ENEMY_WAVES = [
  {
    wave: 1,
    name: 'Seeschlange',
    emoji: '🐍',
    image: 'assets/enemies/seeschlange.png',
    background: 'sea',
    hp: 24,
    atk: 4,
    def: 1,
    pattern: [0, 5, 2, 3, 5, 4, 0, 5],
  },
  {
    wave: 2,
    name: 'Dämon',
    emoji: '😈',
    image: 'assets/enemies/demon.png',
    background: 'hell',
    hp: 30,
    atk: 5,
    def: 2,
    pattern: [0, 7, 6, 5, 0, 7, 13, 5, 0, 6],
  },
  {
    wave: 3,
    name: 'Feuer Einhorn',
    emoji: '🦄',
    image: 'assets/enemies/fireunicorn.png',
    background: 'vulcano',
    hp: 36,
    atk: 6,
    def: 2,
    pattern: [0, 14, 13, 5, 7, 6, 0, 14, 13, 4, 0],
  },
  {
    wave: 4,
    name: 'Eis Drache',
    emoji: '🐲',
    image: 'assets/enemies/frostdragon.png',
    background: 'ice',
    hp: 42,
    atk: 7,
    def: 3,
    pattern: [0, 9, 8, 5, 4, 9, 10, 0, 8, 9, 10, 4],
  },
  {
    wave: 5,
    name: 'Gestalt (Medusa)',
    emoji: '🐍',
    image: 'assets/enemies/medusa.png',
    background: 'castle',
    hp: 50,
    atk: 8,
    def: 3,
    pattern: [0, 12, 11, 5, 0, 12, 11, 4, 14, 13, 12, 11],
  },
];

/**
 * Gibt die Aktion für die aktuelle Runde zurück.
 * @param {number} round - Spielrunde (1-basiert)
 * @param {number[]} pattern
 * @returns {{ id: string, label: string, atkBonus: number, defBonus: number }}
 */
function getEnemyAction(round, pattern) {
  const idx = (round - 1) % pattern.length;
  const type = pattern[idx];
  switch (type) {
    case  1: return { id: 'tail-whip',          label: 'Schwanzpeitsche 🌊',        atkBonus: 1, defBonus: 0 };
    case  2: return { id: 'preparing-blast',     label: 'Bereitet Wasserstoß vor… 💧', atkBonus: 0, defBonus: 0 };
    case  3: return { id: 'water-blast',         label: 'Wasserstoß 💦',             atkBonus: 4, defBonus: 0 };
    case  4: return { id: 'scale-armor',         label: 'Schuppenpanzer 🐢',         atkBonus: 0, defBonus: 3 };
    case  5: return { id: 'rest',                label: 'Ruhephase 😴',              atkBonus: 0, defBonus: 0 };
    case  6: return { id: 'fire-breath',         label: 'Feueratem 🔥',              atkBonus: 3, defBonus: 0 };
    case  7: return { id: 'preparing-fire',      label: 'Bereitet Feueratem vor… 🔥', atkBonus: 0, defBonus: 0 };
    case  8: return { id: 'ice-breath',          label: 'Eisatem ❄️',                atkBonus: 3, defBonus: 0 };
    case  9: return { id: 'preparing-ice',       label: 'Bereitet Eisatem vor… ❄️',  atkBonus: 0, defBonus: 0 };
    case 10: return { id: 'blizzard',            label: 'Blizzard 🌨️',               atkBonus: 5, defBonus: 0 };
    case 11: return { id: 'petrify-gaze',        label: 'Versteinernder Blick 👁️',   atkBonus: 2, defBonus: 2 };
    case 12: return { id: 'preparing-petrify',   label: 'Bereitet Versteinerung vor… 👁️', atkBonus: 0, defBonus: 0 };
    case 13: return { id: 'inferno-charge',      label: 'Inferno-Angriff 🌋',        atkBonus: 5, defBonus: 0 };
    case 14: return { id: 'preparing-inferno',   label: 'Bereitet Inferno vor… 🌋',  atkBonus: 0, defBonus: 0 };
    default: return { id: 'normal-attack',       label: 'Normaler Angriff ⚔️',       atkBonus: 0, defBonus: 0 };
  }
}

/* ============================================================
   3. SPIELZUSTAND
   ============================================================ */

/**
 * Erstellt einen frischen Spielzustand.
 * @returns {object}
 */
function createInitialState() {
  const hero = selectedHero || HEROES.magierin;
  const deckState = { deck: buildDeck(hero.cardPool), discard: [] };
  const hand = drawCards(deckState, 3);
  const waveData = ENEMY_WAVES[0];

  return {
    round: 1,
    wave: 1,
    phase: 'player-turn',
    winner: null,

    player: {
      name: hero.name,
      emoji: hero.emoji,
      image: hero.image,
      cardPool: hero.cardPool,
      hp: hero.hp,
      maxHp: hero.hp,
      atk: hero.atk,
      def: hero.def,
      shieldActive: false,
      shieldFlat: 0,
      mirrorActive: false,
      cardCooldowns: {},
      upgrades: [],
    },

    enemy: {
      name: waveData.name,
      emoji: waveData.emoji,
      image: waveData.image,
      background: waveData.background,
      hp: waveData.hp,
      maxHp: waveData.hp,
      atk: waveData.atk,
      def: waveData.def,
      pattern: waveData.pattern,
    },

    deckState,
    hand,
    log: [],
  };
}

let state = createInitialState();

/* ============================================================
   4. KAMPFLOGIK
   ============================================================ */

function calcDamage(atk, def) {
  return Math.max(1, atk - def);
}

function addLog(message) {
  state.log.unshift(message);
  if (state.log.length > 10) state.log.pop();
}

/**
 * Wendet ein Upgrade auf den Spieler an.
 * @param {'hp'|'atk'} type
 */
function applyUpgrade(type) {
  const p = state.player;
  if (type === 'hp') {
    p.maxHp += 5;
    p.hp = p.maxHp; // volle HP nach Upgrade
    p.upgrades.push('hp');
    addLog(`💖 Upgrade: Max-HP +5 → ${p.maxHp} HP.`);
  } else if (type === 'atk') {
    p.atk += 1;
    p.upgrades.push('atk');
    addLog(`⚔️ Upgrade: ATK +1 → ${p.atk} ATK.`);
  }
}

function loadNextWave() {
  const nextWaveData = ENEMY_WAVES[state.wave];
  state.wave += 1;
  state.round = 1;
  state.phase = 'player-turn';

  // Spieler startet jede neue Welle mit vollen HP
  state.player.hp = state.player.maxHp;
  state.player.shieldActive = false;
  state.player.shieldFlat = 0;
  state.player.mirrorActive = false;
  state.player.cardCooldowns = {};

  // Deck neu aufbauen
  state.deckState = { deck: buildDeck(state.player.cardPool), discard: [] };
  state.hand = drawCards(state.deckState, 3);

  state.enemy = {
    name: nextWaveData.name,
    emoji: nextWaveData.emoji,
    image: nextWaveData.image,
    background: nextWaveData.background,
    hp: nextWaveData.hp,
    maxHp: nextWaveData.hp,
    atk: nextWaveData.atk,
    def: nextWaveData.def,
    pattern: nextWaveData.pattern,
  };

  addLog(`✨ Welle ${state.wave}: ${nextWaveData.emoji} ${nextWaveData.name} erscheint!`);
}

/**
 * Verarbeitet eine gespielte Karte und die Gegneraktion.
 * @param {object} card - Kartenobjekt aus der Hand
 */
function processRound(card) {
  if (state.phase !== 'player-turn') return;

  const p = state.player;
  const e = state.enemy;
  const enemyAction = getEnemyAction(state.round, e.pattern);

  addLog(`── Runde ${state.round} (Welle ${state.wave}) ──`);

  // Gespielte Karte aus der Hand entfernen und ablegen
  state.hand = state.hand.filter(c => c !== card);
  state.deckState.discard.push(card);

  // --- Spieleraktion ---
  const effectiveDef = e.def + (enemyAction.id === 'scale-armor' ? enemyAction.defBonus : 0);

  if (card.type === 'attack' || (card.type === 'special' && card.atkBonus > 0)) {
    const dmg = calcDamage(p.atk + card.atkBonus, effectiveDef);
    e.hp -= dmg;
    addLog(`${card.label} trifft für ${dmg} Schaden.`);
    if (card.heal > 0) {
      const healed = Math.min(card.heal, p.maxHp - p.hp);
      p.hp += healed;
      addLog(`${card.label}: +${healed} HP wiederhergestellt.`);
    }
    if (card.cooldown > 0) {
      p.cardCooldowns[card.id] = card.cooldown;
    }
  } else if (card.shieldMult > 0) {
    p.shieldActive = true;
    addLog(`${card.label} aktiviert — Schaden diese Runde halbiert.`);
  } else if (card.defBonus > 0) {
    addLog(`${card.label} aktiviert — DEF +${card.defBonus} diese Runde.`);
  } else if (card.id === 'mirror') {
    if (state.wave >= 3) {
      p.mirrorActive = true;
      addLog(`🪞 Spiegel aktiviert — der nächste Angriff wird reflektiert!`);
    } else {
      addLog(`🪞 Spiegel noch gesperrt — verfügbar ab Welle 3.`);
    }
  } else if (card.heal > 0) {
    const healed = Math.min(card.heal, p.maxHp - p.hp);
    p.hp += healed;
    addLog(`${card.label}: +${healed} HP wiederhergestellt.`);
  }

  // Prüfen ob Gegner besiegt
  if (e.hp <= 0) {
    e.hp = 0;
    addLog(`🎉 ${e.emoji} ${e.name} ist besiegt!`);

    if (state.wave < ENEMY_WAVES.length) {
      // Upgrade-Auswahl vor nächster Welle
      state.phase = 'upgrade-choice';
      renderGame();
      return;
    } else {
      // Alle Wellen geschafft
      state.phase = 'game-over';
      state.winner = 'player';
      renderGame();
      return;
    }
  }

  // --- Gegneraktion ---
  const preparingIds = ['preparing-blast', 'preparing-fire', 'preparing-ice', 'preparing-inferno', 'preparing-petrify'];
  if (enemyAction.id === 'rest') {
    addLog(`😴 ${e.name} ruht sich aus.`);
  } else if (preparingIds.includes(enemyAction.id)) {
    addLog(`⚠️ ${e.name}: ${enemyAction.label}`);
  } else if (enemyAction.id === 'scale-armor') {
    addLog(`🐢 ${e.name} legt Schuppenpanzer an — DEF +${enemyAction.defBonus} diese Runde.`);
  } else {
    // Angriff
    const rawDmg = calcDamage(e.atk + enemyAction.atkBonus, p.def + (card.defBonus || 0));
    let finalDmg = rawDmg;

    if (p.mirrorActive) {
      // Zufällige Reflexion: 50–100 % des Schadens
      const reflectPct = 0.5 + Math.random() * 0.5;
      const reflectedDmg = Math.max(1, Math.round(rawDmg * reflectPct));
      e.hp -= reflectedDmg;
      finalDmg = 0;
      p.mirrorActive = false;
      const pctDisplay = Math.round(reflectPct * 100);
      addLog(`🪞 Spiegel reflektiert ${pctDisplay}% von ${enemyAction.label} — ${reflectedDmg} Schaden zurück an ${e.name}!`);
    } else if (p.shieldActive) {
      finalDmg = Math.max(1, Math.floor(rawDmg / 2));
      p.shieldActive = false;
      addLog(`🐍 ${enemyAction.label} — ${rawDmg} Schaden, Schild reduziert auf ${finalDmg}.`);
    } else {
      addLog(`🐍 ${enemyAction.label} — ${finalDmg} Schaden.`);
    }

    p.hp -= finalDmg;

    if (p.hp <= 0) {
      p.hp = 0;
      state.phase = 'game-over';
      state.winner = 'enemy';
      addLog(`💀 ${state.player.emoji} ${state.player.name} wurde besiegt.`);
      renderGame();
      return;
    }
  }

  // Cooldowns reduzieren
  Object.keys(p.cardCooldowns).forEach(id => {
    p.cardCooldowns[id] -= 1;
    if (p.cardCooldowns[id] <= 0) delete p.cardCooldowns[id];
  });

  state.round += 1;

  // Auf 3 Karten auffüllen; dabei sicherstellen, dass keine Duplikate in der Hand sind
  // und Spiegel-Karten vor Welle 3 nicht in die Hand kommen
  const needed = 3 - state.hand.length;
  if (needed > 0) {
    const candidates = drawCards(state.deckState, needed * 4); // mehr ziehen als nötig
    const handIds = state.hand.map(c => c.id);
    const unique = [];
    const extra = [];
    for (const c of candidates) {
      // Spiegel vor Welle 3 zurück in den Ablagestapel
      if (c.id === 'mirror' && state.wave < 3) {
        state.deckState.discard.push(c);
        continue;
      }
      if (!handIds.includes(c.id) && !unique.find(u => u.id === c.id)) {
        unique.push(c);
      } else {
        extra.push(c);
      }
    }
    // Erst eindeutige Karten nehmen, dann ggf. mit Duplikaten auffüllen
    const toAdd = [...unique, ...extra].slice(0, needed);
    // Nicht verwendete Karten zurück in den Ablagestapel
    const unused = [...unique, ...extra].slice(needed);
    state.deckState.discard.push(...unused);
    state.hand.push(...toAdd);
  }

  renderGame();
}

/* ============================================================
   5. UI-RENDERING
   ============================================================ */

function renderGame() {
  renderStats();
  renderEnemyIntent();
  renderHand();
  renderLog();
  renderGameOver();
}

function renderStats() {
  const p = state.player;
  const e = state.enemy;

  // Spieler-Name und Avatar aktualisieren
  const playerNameEl = document.getElementById('player-name');
  if (playerNameEl) playerNameEl.textContent = p.name;
  const playerAvatarEl = document.getElementById('player-avatar-emoji');
  if (playerAvatarEl) {
    if (p.image) {
      playerAvatarEl.innerHTML = `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain">`;
    } else {
      playerAvatarEl.textContent = p.emoji;
    }
  }

  const playerHpEl  = document.getElementById('player-hp');
  const playerBarEl = document.getElementById('player-hp-bar');
  if (playerHpEl)  playerHpEl.textContent = `${p.hp} / ${p.maxHp}`;
  if (playerBarEl) {
    const pct = Math.max(0, (p.hp / p.maxHp) * 100);
    playerBarEl.style.width = `${pct}%`;
    playerBarEl.setAttribute('aria-valuenow', p.hp);
    playerBarEl.setAttribute('aria-valuemax', p.maxHp);
    playerBarEl.classList.toggle('hp-bar__fill--low', pct <= 30);
  }

  const enemyHpEl  = document.getElementById('enemy-hp');
  const enemyBarEl = document.getElementById('enemy-hp-bar');
  if (enemyHpEl)  enemyHpEl.textContent = `${e.hp} / ${e.maxHp}`;
  if (enemyBarEl) {
    const pct = Math.max(0, (e.hp / e.maxHp) * 100);
    enemyBarEl.style.width = `${pct}%`;
    enemyBarEl.setAttribute('aria-valuenow', e.hp);
    enemyBarEl.setAttribute('aria-valuemax', e.maxHp);
    enemyBarEl.classList.toggle('hp-bar__fill--low', pct <= 30);
  }

  // Gegner-Name aktualisieren
  const enemyNameEl   = document.getElementById('enemy-name');
  if (enemyNameEl)   enemyNameEl.textContent  = e.name;

  // Gegner-Bild aktualisieren
  const enemyImgEl = document.getElementById('enemy-image');
  if (enemyImgEl) {
    if (e.image) {
      enemyImgEl.src = e.image;
      enemyImgEl.style.display = '';
    } else {
      // Kein Bild: Emoji als Fallback im Avatar anzeigen
      enemyImgEl.style.display = 'none';
    }
  }
  const enemyEmojiEl = document.getElementById('enemy-emoji-fallback');
  if (enemyEmojiEl) {
    enemyEmojiEl.textContent = e.image ? '' : e.emoji;
  }

  // Hintergrundbild der Arena wechseln
  const arenaEl = document.getElementById('battle-arena');
  if (arenaEl && e.background) {
    arenaEl.dataset.bg = e.background;
  }

  // Wellen-Anzeige
  const waveEl = document.getElementById('wave-counter');
  if (waveEl) waveEl.textContent = state.wave;

  const roundEl = document.getElementById('round-counter');
  if (roundEl) roundEl.textContent = state.round;

  const shieldEl = document.getElementById('shield-status');
  if (shieldEl) {
    const active = p.shieldActive || p.shieldFlat > 0 || p.mirrorActive;
    shieldEl.textContent = p.shieldActive
      ? '🛡️ Schild aktiv'
      : p.mirrorActive
        ? '🪞 Spiegel aktiv'
        : p.shieldFlat > 0
          ? `💜 Mana-Schild (${p.shieldFlat})`
          : '';
    shieldEl.hidden = !active;
  }
}

function renderEnemyIntent() {
  const intentEl = document.getElementById('enemy-intent');
  if (!intentEl) return;

  if (state.phase === 'game-over' || state.phase === 'wave-clear') {
    intentEl.textContent = '—';
    intentEl.classList.remove('enemy-intent--danger', 'enemy-intent--warning', 'enemy-intent--rest');
    return;
  }

  const action = getEnemyAction(state.round, state.enemy.pattern);
  intentEl.classList.remove('enemy-intent--danger', 'enemy-intent--warning', 'enemy-intent--rest');

  const dangerIds = ['water-blast', 'fire-breath', 'ice-breath', 'blizzard', 'petrify-gaze', 'inferno-charge'];
  const warningIds = ['preparing-blast', 'preparing-fire', 'preparing-ice', 'preparing-inferno', 'preparing-petrify'];

  if (dangerIds.includes(action.id)) {
    intentEl.textContent = `⚠️ ${state.enemy.name}: ${action.label}`;
    intentEl.classList.add('enemy-intent--danger');
  } else if (warningIds.includes(action.id)) {
    intentEl.textContent = `💡 ${state.enemy.name}: ${action.label} — schütze dich!`;
    intentEl.classList.add('enemy-intent--warning');
  } else if (action.id === 'rest') {
    intentEl.textContent = `😴 ${state.enemy.name} ruht sich aus.`;
    intentEl.classList.add('enemy-intent--rest');
  } else if (action.id === 'scale-armor') {
    intentEl.textContent = `🐢 ${state.enemy.name} legt Schuppenpanzer an (+3 DEF).`;
  } else if (action.id === 'tail-whip') {
    intentEl.textContent = `🌊 ${state.enemy.name} bereitet Schwanzpeitsche vor.`;
  } else {
    intentEl.textContent = `⚔️ ${state.enemy.name} bereitet normalen Angriff vor.`;
  }
}

/**
 * Rendert die Karten in der Hand des Spielers als klickbare Karten-Buttons.
 */
function renderHand() {
  const handEl = document.getElementById('card-hand');
  if (!handEl) return;

  handEl.textContent = '';

  const disabled = state.phase !== 'player-turn';

  state.hand.forEach(card => {
    const onCooldown = !!state.player.cardCooldowns[card.id];

    // Spiegel vor Welle 3 komplett ausblenden
    if (card.id === 'mirror' && state.wave < 3) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `card card--${card.type}`;
    btn.disabled = disabled || onCooldown;
    btn.setAttribute('aria-label', `${card.label}: ${card.desc}`);
    btn.innerHTML = `
      <span class="card__label">${card.label}</span>
      <span class="card__desc">${onCooldown ? `⏳ Cooldown: ${state.player.cardCooldowns[card.id]}` : card.desc}</span>
    `;

    btn.addEventListener('click', () => {
      processRound(card);
    });

    handEl.appendChild(btn);
  });
}

function renderLog() {
  const logEl = document.getElementById('battle-log');
  if (!logEl) return;
  logEl.textContent = '';
  state.log.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    logEl.appendChild(li);
  });
}

function renderGameOver() {
  const overlay = document.getElementById('game-over-overlay');
  const title   = document.getElementById('game-over-title');
  const msg     = document.getElementById('game-over-message');
  if (!overlay || !title || !msg) return;

  if (state.phase === 'upgrade-choice') {
    overlay.hidden = false;
    overlay.className = 'game-over-overlay game-over--wave-clear';
    title.textContent = `🎉 Welle ${state.wave} geschafft!`;
    msg.innerHTML = `
      <span style="display:block;margin-bottom:0.75rem">${state.enemy.emoji} <strong>${state.enemy.name}</strong> besiegt!</span>
      <span style="display:block;margin-bottom:1rem;font-size:0.9em;opacity:0.85">Wähle dein Upgrade für die nächste Welle:</span>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn--primary upgrade-btn" id="btn-upgrade-hp" type="button" style="flex:1;min-width:8rem">
          💖 +5 Max-HP<br><small style="font-weight:400;font-size:0.78em">(aktuell ${state.player.maxHp} HP)</small>
        </button>
        <button class="btn btn--primary upgrade-btn" id="btn-upgrade-atk" type="button" style="flex:1;min-width:8rem">
          ⚔️ +1 Angriff<br><small style="font-weight:400;font-size:0.78em">(aktuell ${state.player.atk} ATK)</small>
        </button>
      </div>
    `;
    const btn = document.getElementById('btn-restart');
    if (btn) btn.style.display = 'none';

    // Buttons sind Teil von msg.innerHTML — direkt per querySelector holen
    const btnHp  = msg.querySelector('#btn-upgrade-hp');
    const btnAtk = msg.querySelector('#btn-upgrade-atk');
    if (btnHp)  btnHp.onclick  = () => { applyUpgrade('hp');  loadNextWave(); renderGame(); };
    if (btnAtk) btnAtk.onclick = () => { applyUpgrade('atk'); loadNextWave(); renderGame(); };
    return;
  }

  if (state.phase === 'game-over') {
    overlay.hidden = false;
    const btn = document.getElementById('btn-restart');
    if (btn) {
      btn.style.display = '';
      btn.textContent = '🔄 Neu starten';
      btn.onclick = () => {
        overlay.hidden = true;
        selectedHero = null;
        showCharacterSelect();
      };
    }
    if (state.winner === 'player') {
      title.textContent = '🏆 Sieg!';
      msg.textContent   = `${state.player.emoji} ${state.player.name} hat alle Gegner besiegt!`;
      overlay.className = 'game-over-overlay game-over--victory';
    } else {
      title.textContent = '💀 Niederlage';
      msg.textContent   = `${state.enemy.emoji} ${state.enemy.name} hat gewonnen. Versuche es erneut!`;
      overlay.className = 'game-over-overlay game-over--defeat';
    }
  } else {
    overlay.hidden = true;
    overlay.className = 'game-over-overlay';
  }
}

/* ============================================================
   6. EVENT-HANDLER & INITIALISIERUNG
   ============================================================ */

/**
 * Zeigt das Charakter-Auswahl-Modal und versteckt die Arena.
 */
function showCharacterSelect() {
  const modal   = document.getElementById('character-select');
  const arena   = document.getElementById('battle-arena');
  const infoBtn = document.getElementById('btn-info-open');
  const backBtn = document.getElementById('btn-back-to-select');
  if (modal)   modal.hidden   = false;
  if (arena)   arena.hidden   = true;
  if (infoBtn) infoBtn.hidden = true;
  if (backBtn) backBtn.hidden = true;

  // Hero-Buttons verdrahten
  Object.values(HEROES).forEach(hero => {
    const btn = document.getElementById(`hero-btn-${hero.id}`);
    if (!btn) return;
    btn.onclick = () => {
      selectedHero = hero;
      if (modal)   modal.hidden   = true;
      if (arena)   arena.hidden   = false;
      if (infoBtn) infoBtn.hidden = false;
      if (backBtn) backBtn.hidden = false;
      state = createInitialState();
      renderGame();
    };
  });
}

/**
 * Verdrahtet den Info-Button und das Info-Modal.
 */
function initInfoModal() {
  const btnOpen  = document.getElementById('btn-info-open');
  const btnClose = document.getElementById('btn-info-close');
  const modal    = document.getElementById('info-modal');
  if (!btnOpen || !btnClose || !modal) return;

  btnOpen.addEventListener('click', () => {
    modal.hidden = false;
  });
  btnClose.addEventListener('click', () => {
    modal.hidden = true;
  });
  // Klick auf Backdrop schließt Modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });
}

function initGame() {
  const arena   = document.getElementById('battle-arena');
  if (!arena) return;

  initInfoModal();

  const backBtn = document.getElementById('btn-back-to-select');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      selectedHero = null;
      showCharacterSelect();
    });
  }

  showCharacterSelect();
}

document.addEventListener('DOMContentLoaded', initGame);
