# TinyHeroes

Ein rundenbasiertes Karten-Kampfspiel als Progressive Web App — direkt im Browser spielbar, kein Build-Schritt, keine Abhängigkeiten.

---

## Spielkonzept

Du steuerst eine **Magierin 🧙‍♀️**, die sich in drei aufsteigend schwieriger werdenden Wellen gegen Seeschlangen behaupten muss. Jede Runde wählst du eine Karte aus deiner Hand — Angriff, Verteidigung oder Spezial — und reagierst dabei auf die angekündigte nächste Aktion des Gegners.

Das Spiel ist bewusst einfach gehalten: keine Meta-Progression, kein Inventar, keine Zufallsevents. Der Fokus liegt auf klaren Entscheidungen und dem Lesen des Gegnermusters.

---

## Charaktere

### Magierin (Spieler)
| Eigenschaft | Wert |
|---|---|
| HP | 22 |
| ATK | 5 |
| DEF | 2 |

### Gegner-Wellen
| Welle | Gegner | HP | ATK | DEF |
|---|---|---|---|---|
| 1 | Seeschlange 🐍 | 24 | 5 | 1 |
| 2 | Große Seeschlange 🐍🐍 | 30 | 6 | 2 |
| 3 | Uralt-Seeschlange 🐲 | 38 | 7 | 3 |

Zwischen den Wellen heilt die Magierin **6 HP**.

---

## Kampfsystem

Der Kampf läuft rundenbasiert ab:

1. Die **nächste Gegner-Aktion** ist immer sichtbar (Intent-Anzeige)
2. Spieler wählt eine Karte aus der Hand
3. Karte wird ausgeführt, Gegner führt seine Aktion aus
4. HP werden aktualisiert, gespielte Karte wird nachgezogen
5. Nächste Runde beginnt

### Schadensformel

```
Schaden = max(1, ATK des Angreifers − DEF des Verteidigers)
```

Schild-Karten halbieren den eingehenden Schaden noch in derselben Runde.

---

## Gegner-Aktionstypen

| Aktion | Beschreibung |
|---|---|
| ⚔️ Normaler Angriff | Standardschaden |
| 💧 Vorbereitungsphase | Kein Schaden — nächste Runde folgt Wasserstoß |
| 🌊 Wasserstoß | Starker Angriff (+3 Bonus) |
| 🐢 Schuppenpanzer | Verteidigung: +3 DEF diese Runde |
| 😴 Ruhephase | Kein Angriff — gute Gelegenheit für starke Karten |

---

## Karten-Deck

Das Deck enthält **11 Karten** (5 Angriff · 5 Verteidigung · 1 Spezial). Du startest mit 3 Karten in der Hand — nach jeder gespielten Karte wird sofort eine neue nachgezogen.

| Karte | Anzahl | Typ | Effekt |
|---|---|---|---|
| 🔥 Feuerball | ×3 | Angriff | Standardschaden (ATK − DEF) |
| ❄️ Eissplitter | ×1 | Angriff | +1 Bonusschaden |
| ✨ Arkaner Blitz | ×1 | Angriff | +2 Bonusschaden |
| 🛡️ Schild | ×2 | Verteidigung | Halbiert Schaden diese Runde |
| 💜 Mana-Schild | ×2 | Verteidigung | Blockt 3 Schaden flach |
| 💚 Heiltrank | ×1 | Verteidigung | Heilt 4 HP |
| 🏹 Armbrust | ×1 | Spezial | +4 Bonusschaden, danach 1 Runde Cooldown |

---

## Strategie-Tipps

- **Vorbereitungsphase** des Gegners = Schild oder Mana-Schild einsetzen, bevor der Wasserstoß kommt
- **Ruhephase** des Gegners = starke Angriffskarten spielen (Armbrust, Arkaner Blitz)
- **Schuppenpanzer** = schwache Angriffe verpuffen; lieber heilen oder Schild legen
- Armbrust hat Cooldown — nicht verschwenden, wenn der Gegner gerade verteidigt

---

## Projekt-Struktur

```
TinyHeroes/
├── index.html          # Spieloberfläche (Arena, Karten-Hand, Kampflog)
├── manifest.json       # PWA-Manifest
├── service-worker.js   # Offline-Cache (optional)
├── css/
│   └── style.css       # Alle Stile inkl. Spiel-Komponenten (Sektion 16)
├── js/
│   ├── game.js         # Spiellogik: State, Kampf, Rendering, Events
│   └── main.js         # Boilerplate-Logik (Nav, Footer-Jahr etc.)
└── assets/
    └── icons/          # Favicons, PWA-Icons, OG-Image
```

### Architektur von `game.js`

| Abschnitt | Inhalt |
|---|---|
| Konstanten | `CARD_POOL`, `ENEMY_WAVES` |
| Game State | `createInitialState()`, `buildDeck()`, `drawCards()` |
| Kampflogik | `processRound()`, `calcDamage()`, `getEnemyAction()`, `loadNextWave()` |
| Rendering | `renderGame()`, `renderHand()`, `renderIntent()`, `renderLog()` |
| Init | `initGame()`, Event-Handler |

---

## Starten

```sh
# Option 1 — direkt öffnen
open index.html

# Option 2 — lokaler Server (empfohlen für PWA)
python3 -m http.server 8000
# → http://localhost:8000
```

Kein npm, kein Build-Schritt, keine externen Abhängigkeiten.

---

## Technologie

- Vanilla HTML / CSS / JavaScript
- CSS Custom Properties (Design Tokens)
- PWA-fähig (manifest.json + service-worker.js)
- Keine Frameworks, keine Build-Tools
