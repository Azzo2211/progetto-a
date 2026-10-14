# Progetto A – Metodo Integrale

Web app personale di allenamento: scacchi, scenari, cultura, piani, difesa, logica, memoria, influenza ed estetica, con un quadro generale (esagoni abilità) che si aggiorna con i risultati.

## Avvio

Serve Node.js. Dalla cartella del progetto:

```powershell
node local-server.js
```

Poi apri **http://localhost:8765** (non aprire `index.html` con doppio click: Stockfish funziona solo dal server locale).

## Modulo scacchi

| File | Cosa fa |
|---|---|
| `engine/` | Stockfish 17.1 Lite (WASM, licenza GPL). Due motori separati: uno per il bot, uno per l'analisi. |
| `vendor/chess.js` | Regole degli scacchi, notazione, patta per ripetizione/50 mosse (chess.js, BSD-2). |
| `chess/opening-book.js` | Libro aperture (circa 3.900 aperture con nome, dal database CC0 di Lichess). |
| `chess/analysis-core.js` | Probabilità di vittoria, precisione (metodo Lichess), classificazione mosse, pattern di errore, commenti del coach. |
| `chess/bot.js` | I 19 livelli del bot (da 250 a 3600 Elo) e la scelta delle mosse. |
| `chess/review.js` | Revisione della partita: analizza ogni posizione e costruisce il report. |
| `chess/board-view.js` | Scacchiera: pezzi animati (si alzano e si appoggiano con l'ombra, il cavallo salta, il pezzo catturato cade con un taglio cremisi, il re trema allo scacco e cade allo scacco matto) ed effetti speciali in stile Classroom disattivabili (scie color ghiaccio, luce su traversa e colonna, mirino, linee di velocita' sulle catture, lampo in bianco e nero allo scacco); trascinamento, frecce, promozione, temi di colore, suoni. |
| `chess/chess-ui.js` | Pagina scacchi: schede, scelta del bot, barre dei giocatori, coach, suggerimenti, fine partita. |
| `chess/coach.js` | Coach in allenamento: pezzi in presa, matti in una, minacce del bot, consigli d'apertura. |
| `chess/lessons.js` | 40 lezioni per grado (teoria, esempi guidati, esercizi). |
| `chess/trainer.js` | Esercizi sulla scacchiera principale (lezioni, puzzle, errori delle tue partite). |
| `chess/learn-ui.js` / `chess/grade-ui.js` | Schede Lezioni e Grado. |
| `chess/rating.js` | Rating Glicko contro i bot e sugli esercizi, requisiti dei gradi E-S. |
| `chess/skills.js` | Profilo di gioco a 6 categorie: eventi per mossa (errori e mosse buone) e aggiornamento dopo ogni partita. |
| `chess/puzzles.json` | 4.070 esercizi dal database Lichess (CC0), da 400 a 2600 di rating. |
| `assets/pieces/` | Set "Classroom" (predefinito, originale, disegnato in stile anime Classroom of the Elite), "Elite 3D" (stessi pezzi, resa realistica) e set di lichess.org (licenze in `assets/pieces/LICENSE.md`). |
| `tools/pieces3d/` | Generatore 3D dei set Classroom ed Elite 3D (three.js): forme, materiali, cel shading anime, rendering in WebP. |
| `app.js` | Logica della partita, revisione e quadro. |

### Grado E-S: come si misura
Il grado non e' una stima a occhio: e' **certificato** solo quando tutti i requisiti sono soddisfatti.
- **Rating partite**: Glicko-1 contro i bot (ogni bot ha un Elo calibrato). Contano solo le partite *valutate* (niente suggerimenti, niente mosse annullate) di almeno 8 mosse.
- **Rating esercizi**: Glicko-1 sui puzzle Lichess, che hanno un rating noto. Conta solo il primo tentativo.
- **Precisione**: media delle ultime 5 partite valutate, calcolata da Stockfish.
- **Requisiti per grado**: numero di partite, rating minimo, una vittoria contro un bot di quel livello, rating esercizi, precisione e lezioni del grado completate.

| Grado | Elo | Partite | Esercizi | Vittoria contro | Precisione |
|---|---|---|---|---|---|
| E | sotto 600 | - | - | - | - |
| D | 600+ | 5 | 800 (15) | 550 | 60% |
| C | 1000+ | 10 | 1200 (30) | 1000 | 70% |
| B | 1400+ | 15 | 1600 (50) | 1450 | 76% |
| A | 1800+ | 20 | 2000 (75) | 1800 | 81% |
| S | 2200+ | 25 | 2400 (100) | 2200 | 85% |

Per certificare un grado serve anche il **profilo di gioco** (D 45, C 60, B 70, A 80, S 90).

### Profilo di gioco (6 categorie)
Ogni mossa analizzata da Stockfish genera eventi con una categoria e dei punti:

| Categoria | Toglie punti | Aggiunge punti |
|---|---|---|
| Concentrazione | blunder, pezzo lasciato in presa | 10 mosse di fila senza errori |
| Calcolo | variante calcolata male, errori in posizioni critiche | mosse brillanti e "grandi", migliore in posizione critica |
| Strategia | sviluppo lento, mosse senza piano, errori nel finale, imprecisioni | mosse precise in posizioni tranquille |
| Visione minacce | minaccia non vista, occasione mancata | punire l'errore del bot |
| Sicurezza re | re esposto, scacco matto subito | arrocco entro la decima mossa |
| Controllo impulso | errori giocati in meno di 5 secondi | pensare almeno 8 secondi nei momenti critici |

Vittoria +1,5, patta +0,5, sconfitta -1 a tutte. I punti valgono di piu' contro bot forti e di meno contro bot deboli; massimo 12 punti per categoria a partita; le partite di allenamento contano meno. Il totale e' la media delle 6 categorie (anche nel quadro). La scheda Lezioni ha un **reparto errori** per categoria con le tue posizioni sbagliate, esercizi mirati e le lezioni collegate.

### Come gioca il bot
Stockfish trova le mosse migliori e le valuta. Per ogni mossa il bot decide, con probabilità fissate per il suo livello, se giocare bene oppure commettere un'imprecisione, un errore o un blunder: l'errore viene scelto tra le mosse che perdono proprio quella quota di probabilità di vittoria. Le frequenze sono calibrate facendo giocare i bot tra loro e misurando la precisione con la stessa formula della revisione (`tools/calibrate.js`). I livelli 18 e 19 giocano a piena forza.

### Come viene giudicata una mossa
- **Precisione**: formula pubblica di Lichess sulla probabilità di vittoria persa, media pesata sui momenti critici. Nessuna correzione manuale.
- **Classificazione**: soglie "expected points" di chess.com (Ottima ≤ 2 punti persi, Buona ≤ 5, Imprecisione ≤ 10, Errore ≤ 20, Blunder oltre). Libro = posizione nel libro aperture. Grande = unica mossa buona. Brillante = sacrificio corretto. Mancata = non hai sfruttato un errore dell'avversario quando la partita era ancora aperta.
- **Pattern**: pezzo in presa, minaccia ignorata, sicurezza del re, calcolo, sviluppo, finale, mancanza di piano, impulsività (errore giocato in meno di 5 secondi).

## Test

```powershell
node tests/chess-core.test.js
node tests/chess-trainer.test.js
node tools/verify-lessons.js           # controlla esempi ed esercizi delle lezioni con Stockfish
node tools/calibrate.js self:8 6       # precisione media del livello 8 su 6 partite bot contro bot
node tools/calibrate.js match:10-12 10 # scontro diretto tra due livelli
```
