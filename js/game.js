/**
 * ============================================================
 * TinyHeroes — game.js  (v4 — Multi-Runden / Vorbereitungsphase)
 * ============================================================
 * Rundenbasiertes Karten-Kampfspiel: Magierin vs. Gegner-Wellen.
 *
 * Neu in v4:
 *   - Doppelzauber entfernt
 *   - Vorbereitungsphase vor Spezialangriff (Schlange kündigt an)
 *   - Mehr Ruhephasen für die Schlange
 *   - Multi-Runden-System: mehrere Gegner mit steigender Schwierigkeit
 *   - Spieler heilt zwischen den Runden leicht
 *
 * Struktur:
 *   1. Kartendefinitionen & Deck-System
 *   2. Gegner-Definitionen
 *   3. Spielzustand (Game State)
 *   4. Kampflogik
 *   5. UI-Rendering
 *   6. Event-Handler & Initialisierung
 * ============================================================
 */

/* ============================================================
   1. KARTENDEFINITIONEN & DECK-SYSTEM
   ============================================================ */

/**
 * Festes Deck: 5× Angriff, 5× Verteidigung, 1× Spezial.
 * count gibt an, wie oft die Karte im Deck vorkommt.
 * type: 'attack' | 'defense' | 'special'
 */
const CARD_POOL = [
  // ── Angriff (5 Karten gesamt) ──────────────────────────────
  { id: 'fireball',       label: '🔥 Feuerball',    type: 'attack',  desc: 'ATK − DEF Schaden',            atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 3 },
  { id: 'ice-shard',      label: '❄️ Eissplitter',   type: 'attack',  desc: '+1 Schaden',                   atkBonus: 1, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
  { id: 'arcane-bolt',    label: '✨ Arkaner Blitz', type: 'attack',  desc: '+2 Schaden',                   atkBonus: 2, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 0, count: 1 },
  // ── Verteidigung (5 Karten gesamt) ─────────────────────────
  { id: 'shield',         label: '🛡️ Schild',        type: 'defense', desc: 'Halbiert Schaden diese Runde', atkBonus: 0, defBonus: 0, heal: 0, shieldMult: 0.5, cooldown: 0, count: 2 },
  { id: 'mana-shield',    label: '💜 Mana-Schild',   type: 'defense', desc: 'Blockt 3 Schaden',             atkBonus: 0, defBonus: 3, heal: 0, shieldMult: 0,   cooldown: 0, count: 2 },
  { id: 'healing-potion', label: '💚 Heiltrank',     type: 'defense', desc: 'Heilt 4 HP',                   atkBonus: 0, defBonus: 0, heal: 4, shieldMult: 0,   cooldown: 0, count: 1 },
  // ── Spezial (1 Karte) ───────────────────────────────────────
  { id: 'crossbow',       label: '🏹 Armbrust',      type: 'special', desc: '+4 Schaden, Cooldown 1',       atkBonus: 4, defBonus: 0, heal: 0, shieldMult: 0,   cooldown: 1, count: 1 },
];

/**
 * Erstellt ein gemischtes Deck aus dem Kartenpool.
 * @returns {object[]} Gemischtes Deck
 */
function buildDeck() {
  const deck = [];
  CARD_POOL.forEach(card => {
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
 * Gegner-Wellen: aufsteigende Schwierigkeit.
 * Jede Welle definiert Name, Emoji, Stats und ein Aktionsmuster.
 *
 * Aktionstypen:
 *   0 = normal-attack   (normaler Angriff)
 *   1 = tail-whip       (Schwanzpeitsche, +1 ATK)
 *   2 = preparing-blast (Vorbereitungsphase — kein Schaden, kündigt Wasserstoß an)
 *   3 = water-blast     (Wasserstoß, +4 ATK — folgt immer auf preparing-blast)
 *   4 = scale-armor     (Schuppenpanzer, +3 DEF)
 *   5 = rest            (Ruhephase — kein Angriff)
 */
const ENEMY_WAVES = [
  {
    wave: 1,
    name: 'Seeschlange',
    emoji: '🐍',
    hp: 24,
    atk: 4,
    def: 1,
    // Muster: viel Ruhe, eine Vorbereitung + Wasserstoß, ein Schuppenpanzer
    pattern: [0, 5, 2, 3, 5, 4, 0, 5],
  },
  {
    wave: 2,
    name: 'Große Seeschlange',
    emoji: '🐉',
    hp: 30,
    atk: 5,
    def: 2,
    pattern: [0, 1, 5, 2, 3, 4, 0, 5, 1, 2, 3],
  },
  {
    wave: 3,
    name: 'Uralt-Seeschlange',
    emoji: '🌊',
    hp: 36,
    atk: 6,
    def: 2,
    pattern: [0, 1, 4, 2, 3, 5, 0, 1, 2, 3, 4, 0],
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
    case 1: return { id: 'tail-whip',       label: 'Schwanzpeitsche 🌊', atkBonus: 1, defBonus: 0 };
    case 2: return { id: 'preparing-blast', label: 'Bereitet Wasserstoß vor… 💧', atkBonus: 0, defBonus: 0 };
    case 3: return { id: 'water-blast',     label: 'Wasserstoß 💦',      atkBonus: 4, defBonus: 0 };
    case 4: return { id: 'scale-armor',     label: 'Schuppenpanzer 🐢',  atkBonus: 0, defBonus: 3 };
    case 5: return { id: 'rest',            label: 'Ruhephase 😴',       atkBonus: 0, defBonus: 0 };
    default: return { id: 'normal-attack',  label: 'Normaler Angriff 🐍', atkBonus: 0, defBonus: 0 };
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
  const deckState = { deck: buildDeck(), discard: [] };
  const hand = drawCards(deckState, 3);
  const waveData = ENEMY_WAVES[0];

  return {
    round: 1,          // Kampfrunde innerhalb der aktuellen Welle
    wave: 1,           // Aktuelle Welle (1–3)
    phase: 'player-turn', // 'player-turn' | 'game-over' | 'wave-clear'
    winner: null,

    player: {
      name: 'Magierin',
      hp: 22,
      maxHp: 22,
      atk: 5,
      def: 2,
      shieldActive: false,
      shieldFlat: 0,
      cardCooldowns: {},
    },

    enemy: {
      name: waveData.name,
      emoji: waveData.emoji,
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
 * Lädt den nächsten Gegner (nächste Welle).
 * Spieler heilt leicht zwischen den Wellen.
 */
function loadNextWave() {
  const nextWaveData = ENEMY_WAVES[state.wave]; // wave ist 0-basiert hier (state.wave = bisherige Welle)
  state.wave += 1;
  state.round = 1;
  state.phase = 'player-turn';

  // Spieler heilt 6 HP zwischen den Wellen
  const healAmount = Math.min(6, state.player.maxHp - state.player.hp);
  state.player.hp += healAmount;
  state.player.shieldActive = false;
  state.player.shieldFlat = 0;
  state.player.cardCooldowns = {};

  state.enemy = {
    name: nextWaveData.name,
    emoji: nextWaveData.emoji,
    hp: nextWaveData.hp,
    maxHp: nextWaveData.hp,
    atk: nextWaveData.atk,
    def: nextWaveData.def,
    pattern: nextWaveData.pattern,
  };

  addLog(`✨ Welle ${state.wave}: ${nextWaveData.emoji} ${nextWaveData.name} erscheint!`);
  if (healAmount > 0) addLog(`💚 Magierin erholt sich: +${healAmount} HP.`);
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
    if (card.cooldown > 0) {
      p.cardCooldowns[card.id] = card.cooldown;
    }
  } else if (card.id === 'shield') {
    p.shieldActive = true;
    addLog(`🛡️ Schild aktiviert — Schaden diese Runde halbiert.`);
  } else if (card.id === 'mana-shield') {
    p.shieldFlat = card.defBonus;
    addLog(`💜 Mana-Schild aktiv — blockt ${card.defBonus} Schaden.`);
  } else if (card.id === 'healing-potion') {
    const healed = Math.min(card.heal, p.maxHp - p.hp);
    p.hp += healed;
    addLog(`💚 Heiltrank: +${healed} HP wiederhergestellt.`);
  }

  // Prüfen ob Gegner besiegt
  if (e.hp <= 0) {
    e.hp = 0;
    addLog(`🎉 ${e.emoji} ${e.name} ist besiegt!`);

    if (state.wave < ENEMY_WAVES.length) {
      // Nächste Welle
      state.phase = 'wave-clear';
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
  if (enemyAction.id === 'rest') {
    addLog(`😴 ${e.name} ruht sich aus.`);
  } else if (enemyAction.id === 'preparing-blast') {
    addLog(`💧 ${e.name} bereitet einen Wasserstoß vor — sei bereit!`);
  } else if (enemyAction.id === 'scale-armor') {
    addLog(`🐢 ${e.name} legt Schuppenpanzer an — DEF +${enemyAction.defBonus} diese Runde.`);
  } else {
    // Angriff
    const rawDmg = calcDamage(e.atk + enemyAction.atkBonus, p.def);
    let finalDmg = rawDmg;

    if (p.shieldActive) {
      finalDmg = Math.max(1, Math.floor(rawDmg / 2));
      p.shieldActive = false;
      addLog(`🐍 ${enemyAction.label} — ${rawDmg} Schaden, Schild reduziert auf ${finalDmg}.`);
    } else if (p.shieldFlat > 0) {
      finalDmg = Math.max(0, rawDmg - p.shieldFlat);
      addLog(`🐍 ${enemyAction.label} — ${rawDmg} Schaden, Mana-Schild blockt ${p.shieldFlat} → ${finalDmg}.`);
      p.shieldFlat = 0;
    } else {
      addLog(`🐍 ${enemyAction.label} — ${finalDmg} Schaden.`);
    }

    p.hp -= finalDmg;

    if (p.hp <= 0) {
      p.hp = 0;
      state.phase = 'game-over';
      state.winner = 'enemy';
      addLog(`💀 Die Magierin wurde besiegt.`);
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

  // Nur die gespielte Karte nachziehen (Hand behalten)
  const [newCard] = drawCards(state.deckState, 1);
  if (newCard) state.hand.push(newCard);

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

  // Gegner-Name und Emoji aktualisieren
  const enemyNameEl   = document.getElementById('enemy-name');
  const enemyAvatarEl = document.getElementById('enemy-avatar');
  if (enemyNameEl)   enemyNameEl.textContent  = e.name;
  if (enemyAvatarEl) enemyAvatarEl.textContent = e.emoji;

  // Wellen-Anzeige
  const waveEl = document.getElementById('wave-counter');
  if (waveEl) waveEl.textContent = state.wave;

  const roundEl = document.getElementById('round-counter');
  if (roundEl) roundEl.textContent = state.round;

  const shieldEl = document.getElementById('shield-status');
  if (shieldEl) {
    const active = p.shieldActive || p.shieldFlat > 0;
    shieldEl.textContent = p.shieldActive
      ? '🛡️ Schild aktiv'
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

  switch (action.id) {
    case 'water-blast':
      intentEl.textContent = `⚠️ ${state.enemy.name} führt Wasserstoß aus!`;
      intentEl.classList.add('enemy-intent--danger');
      break;
    case 'preparing-blast':
      intentEl.textContent = `💧 ${state.enemy.name} bereitet Wasserstoß vor — schütze dich!`;
      intentEl.classList.add('enemy-intent--warning');
      break;
    case 'tail-whip':
      intentEl.textContent = `🌊 ${state.enemy.name} bereitet Schwanzpeitsche vor.`;
      break;
    case 'scale-armor':
      intentEl.textContent = `🐢 ${state.enemy.name} legt Schuppenpanzer an (+3 DEF).`;
      break;
    case 'rest':
      intentEl.textContent = `😴 ${state.enemy.name} ruht sich aus.`;
      intentEl.classList.add('enemy-intent--rest');
      break;
    default:
      intentEl.textContent = `🐍 ${state.enemy.name} bereitet normalen Angriff vor.`;
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

  if (state.phase === 'wave-clear') {
    overlay.hidden = false;
    overlay.className = 'game-over-overlay game-over--wave-clear';
    title.textContent = `🎉 Welle ${state.wave - 1} geschafft!`;
    msg.textContent   = `${state.enemy.emoji} ${state.enemy.name} besiegt! Nächster Gegner wartet…`;
    const btn = document.getElementById('btn-restart');
    if (btn) {
      btn.textContent = '▶️ Weiter';
      btn.onclick = () => {
        loadNextWave();
        renderGame();
      };
    }
    return;
  }

  if (state.phase === 'game-over') {
    overlay.hidden = false;
    const btn = document.getElementById('btn-restart');
    if (btn) {
      btn.textContent = '🔄 Neu starten';
      btn.onclick = () => {
        state = createInitialState();
        renderGame();
      };
    }
    if (state.winner === 'player') {
      title.textContent = '🏆 Sieg!';
      msg.textContent   = `Die Magierin hat alle Gegner besiegt!`;
      overlay.className = 'game-over-overlay game-over--victory';
    } else {
      title.textContent = '💀 Niederlage';
      msg.textContent   = 'Die Seeschlange hat gewonnen. Versuche es erneut!';
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

function initGame() {
  const arena = document.getElementById('battle-arena');
  if (!arena) return;

  state = createInitialState();

  if (!arena.dataset.initialized) {
    arena.dataset.initialized = 'true';

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        state = createInitialState();
        renderGame();
      });
    }
  }

  renderGame();
}

document.addEventListener('DOMContentLoaded', initGame);
