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

## Modulo scenari: esami speciali

La pagina Scenari (cartella `scenarios/`) allena le situazioni sociali e di lavoro in stile *Classroom of the Elite*.

| File | Cosa fa |
|---|---|
| `scenarios/exams.js` | Gli esami speciali: fascicolo (situazione, persone, obiettivo), 3 round da 4 mosse, la frase da scrivere, la verità nascosta, il principio e la tecnica da riusare. |
| `scenarios/free.js` | Scenari per la risposta libera, con risposta modello ed elementi chiave. |
| `scenarios/engine.js` | Valutazione: punteggio dell'esame, frase scritta, profilo, classi, punti privati, consigli. Senza DOM, testato in `tests/scenarios.test.js`. |
| `scenarios/ui.js`, `scenarios/scenarios.css` | La pagina: schede Esami, Risposta libera, Profilo. |

**Esame**: ogni round ha una mossa migliore, mosse buone, deboli ed errori; ogni mossa ha la sua conseguenza e la spiegazione. Se sbagli, il round dopo parte da una situazione peggiorata. In un momento chiave scrivi la frase esatta: viene valutata su tre elementi attesi dalla scena e su segnali di comunicazione (accuse, minacce, troppe scuse, prima persona, richiesta concreta). Voto = mosse 80% + frase 20% (S ≥ 92, A ≥ 80, B ≥ 65, C ≥ 50).

**Profilo (6 categorie)**: Lettura, Autocontrollo, Assertività, Empatia, Strategia, Etica. Partono da 40; ogni mossa sposta alcune categorie, la somma è pesata per difficoltà (gli esami avanzati fanno guadagnare di più e perdere meno), massimo 8 punti per categoria a esame. Le ripetizioni contano un quarto e non danno punti privati. La risposta libera pesa il 60% perché il testo è valutato automaticamente. Il totale è la media delle 6 categorie.

**Classi**: D di partenza; C con profilo ≥ 50 e 4 esami; B con profilo ≥ 65 e 10 esami (3 avanzati); A con profilo ≥ 80, 18 esami (6 avanzati) e tutte le categorie provate. La classe può anche scendere se il profilo cala.

## Modulo cultura: biblioteca e ripasso distanziato

La pagina Cultura (cartella `culture/`) è una biblioteca di schede brevi da capire e ricordare.

| File | Cosa fa |
|---|---|
| `culture/cards.js` | Le schede: 8 aree (storia, geopolitica, diritto, economia, tecnologia, scienza, filosofia e psicologia, arte e letteratura), con testo, fatti da ricordare, collegamenti, 5 domande con spiegazione e "spiegalo con parole tue". |
| `culture/engine.js` | Ripasso distanziato (scatole di Leitner), statistiche e profilo. Senza DOM, testato in `tests/culture.test.js`. |
| `culture/ui.js`, `culture/culture.css` | La pagina: Biblioteca, Ripasso, Profilo. |

**Studio**: leggi la scheda, rispondi a 5 domande (dato, comprensione, applicazione, collegamento) con la spiegazione subito dopo, poi scrivi la spiegazione con parole tue e la confronti con il modello. Con 4 o 5 risposte giuste la scheda torna in ripasso dopo 3 giorni, altrimenti il giorno dopo.

**Ripasso**: ogni scheda in scadenza propone 2 domande (prima quelle sbagliate in passato). Tutte giuste: il ripasso successivo si allontana (1, 3, 7, 16, 35 giorni); tutte sbagliate: torna al giorno dopo.

**Profilo (6 categorie, calcolato dalle risposte)**: Comprensione, Collegamenti e Applicazione = percentuale di risposte giuste a quel tipo di domanda (con una partenza prudente al 35%); Memoria = risposte giuste nei ripassi, cala se lasci scadere i ripassi da più di una settimana; Ampiezza = schede consolidate e aree coperte; Costanza = ripassi fatti in tempo e giorni di studio nelle ultime due settimane. Rifare la verifica di una scheda già studiata non cambia le statistiche.

## Modulo difesa: arti marziali "metodo Johan Seong"

La scheda **Arti marziali** è la parte principale della pagina Difesa. Il tema è Johan Seong di Lookism (usato solo come motivazione nei testi: osserva, copia, fallo tuo).

| File | Cosa fa |
|---|---|
| `defense/martial-data.js` | 7 discipline (boxe, muay thai, taekwondo, karate, capoeira, lotta, kung fu Wing Chun), 6 livelli ciascuna da 5-6 esercizi: dose (serie, ripetizioni o secondi, recupero), criterio di "riuscito", versione più facile, esercizi preparatori prima di quelli difficili o di flessibilità, ricerca video su YouTube. |
| `defense/martial.js` | Settimana a rotazione, livelli, storico. Senza DOM, testato in `tests/martial.test.js`. |
| `defense/martial-ui.js`, `defense/martial.css` | Le viste Oggi, Settimana, Stili, Progressi. |

**Settimana**: di base 5 giorni (lunedì-venerdì, modificabili). Ogni giorno uno stile diverso; le discipline cambiano di settimana in settimana (prima quelle che non fai da più tempo) e ogni giorno si può cambiare a mano. Gli stili si possono togliere dalla rotazione.

**Allenamento**: gli esercizi del livello attuale, ognuno con timer (serie a tempo o a ripetizioni, recupero, cambio lato, segnali casuali per lo shadow). Per ogni esercizio segni "Riuscito" o "Non ancora"; alla fine decidi tu se salire di livello (l'app consiglia di salire con almeno l'80% riuscito). All'ultimo livello si può dichiarare lo stile "copiato al 100%". Il livello si può cambiare a mano anche dalla scheda dello stile.

**Progressi**: settimana in corso, settimane complete di fila, allenamenti e minuti, quanto hai copiato di ogni stile, calendario delle ultime 8 settimane, cambi di livello e ultimi allenamenti. Gli allenamenti contano anche per Tecnica e Costanza nel profilo della Difesa.

## Modulo difesa: programma, riflessi, situazioni

La pagina Difesa (cartella `defense/`) parte da un principio: prima si evita, poi si calma, poi si esce. La tecnica serve a proteggersi e ad andarsene.

| File | Cosa fa |
|---|---|
| `defense/program.js` | 17 tecniche (postura a mani aperte, guardia, passi, distanza, parate, coperture, liberazioni dalle prese, caduta, rialzarsi, sequenza di uscita) con passi, punti chiave, errori comuni, come allenarle da soli o con un partner; riscaldamento; 12 sessioni in 4 fasi. |
| `defense/situations.js` | 36 situazioni decisionali in 6 aree (prevenzione, confini e calma, uscire, oggetti e rapine, la legge, il dopo). Ogni opzione ha un voto e una nota; le note legali citano le fonti. |
| `defense/figure.js`, `defense/scenes.js` | Manichino SVG con cinematica inversa: ogni tecnica ha i suoi fotogrammi animati (tu in ambra, il partner in grigio). Anteprima di tutte le pose: `tools/defense/preview.html`. |
| `defense/engine.js` | Sblocco delle sessioni, prove di riflessi, ripasso delle situazioni, profilo. Senza DOM, testato in `tests/defense.test.js`. |
| `defense/ui.js`, `defense/defense.css` | La pagina: Programma, Riflessi, Situazioni, Profilo. |

**Sessione guidata**: riscaldamento a tempo, le tecniche della sessione (figura animata con i fotogrammi da scorrere), alcuni round in cui l'app chiama i comandi ad alta voce (voce e suoni si possono spegnere), autovalutazione finale (Sì / A volte / No). Una sessione conta solo se fai davvero almeno il 70% dei round (chiuderli prima non vale); la successiva si sblocca con un'autovalutazione almeno del 40%. Le cadute non vengono mai chiamate nei round.

**Riflessi**: tre prove a protocollo fisso, così i numeri sono confrontabili nel tempo. Semaforo (24 prove: al verde rispondi, al rosso resti fermo), Direzione (20 frecce, rispondi con la stessa direzione), Periferica (fissi il centro, un lampo mostra una forma e un punto ai bordi: il lampo si accorcia quando rispondi giusto). Risposte sotto i 120 ms sono anticipi. Una prova conta per i Riflessi e per il record solo se valida (Semaforo: almeno 12 verdi presi su 18 e al massimo 2 risposte al rosso; Direzione: almeno 70% di risposte giuste); interromperla dopo metà la registra come non valida.

**Situazioni**: turni da 6. Si legge con calma, poi si aprono le opzioni e parte il tempo. Rifare lo stesso giorno situazioni già viste è pratica e non cambia il profilo. Le risposte sbagliate tornano il giorno dopo, quelle giuste sempre più di rado (1, 3, 8, 21, 45 giorni).

**Profilo (6 categorie, calcolato dai dati)**: Prevenzione (situazioni di prevenzione e uscita + Periferica), Decisione (le altre situazioni, il tempo scaduto conta come errore), Riflessi (tempo mediano nelle ultime prove), Controllo (risposte al rosso, anticipi, direzioni sbagliate), Tecnica (sessioni completate e media delle ultime autovalutazioni, cala dopo 10 giorni di stop), Costanza (giorni di allenamento nelle ultime due settimane). Aprire una pagina o rispondere a caso non gonfia nulla.

## Test

```powershell
node tests/chess-core.test.js
node tests/chess-trainer.test.js
node tests/scenarios.test.js
node tests/culture.test.js
node tests/defense.test.js
node tests/martial.test.js
node tools/verify-lessons.js           # controlla esempi ed esercizi delle lezioni con Stockfish
node tools/calibrate.js self:8 6       # precisione media del livello 8 su 6 partite bot contro bot
node tools/calibrate.js match:10-12 10 # scontro diretto tra due livelli
```
