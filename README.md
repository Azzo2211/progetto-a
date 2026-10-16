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
| `chess/board-view.js` | Scacchiera: pezzi animati (si alzano e si appoggiano con l'ombra, il cavallo salta, il pezzo catturato cade con un taglio cremisi, il re trema allo scacco e cade allo scacco matto) ed effetti speciali in stile Classroom disattivabili (scie color ghiaccio, luce su traversa e colonna, mirino, linee di velocita' sulle catture, lampo in bianco e nero allo scacco); tocco-tocco o trascinamento (anche su telefono), premosse mentre il bot pensa (case in blu, si giocano da sole se ancora legali, donna automatica in promozione), frecce, promozione, temi di colore, suoni. |
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

## Sul telefono (app installabile)

Il sito è una web app installabile (`manifest.webmanifest`, icone in `icons/`, `sw.js` per usarla anche senza rete).

1. Pubblicazione con GitHub Pages: nel repository, Settings → Pages → "Deploy from a branch" → `main` e cartella `/ (root)` → Save. Dopo un minuto il sito è su https://azzo2211.github.io/progetto-a/ e si aggiorna da solo a ogni push su `main`.
2. Sul telefono apri quell'indirizzo e installa: su Android con Chrome, menu ⋮ → "Installa app" (o "Aggiungi a schermata Home"); su iPhone con Safari, Condividi → "Aggiungi alla schermata Home".
3. I dati restano nel dispositivo. Per portare i progressi dal computer al telefono: Quadro → "I tuoi dati" → "Esporta i dati" sul computer, poi "Importa da file" sul telefono.

Il service worker usa prima la rete: con internet carichi sempre l'ultima versione, senza internet la copia dell'ultima visita.

## Modulo mira (Valorant)

Pagina **Mira** (cartella `aim/`): allenamento della mira in prima persona e ricerca della sensibilità, pensati per Valorant.

| File | Cosa fa |
|---|---|
| `aim/engine.js` | Calcoli della sensibilità come in Valorant (0,07 gradi per unità di movimento a sens 1, campo visivo orizzontale 103 gradi, eDPI, cm/360), calibrazione del mouse, proiezione 3D e colpi, gli 8 scenari con 3 livelli (Gridshot, Precisione, Linea della testa, Counter-strafe, Peek dagli angoli, Duelli ADAD, Tracking ADAD, Riflessi) più la Prova sensibilità a tre fasi, l'analisi dei flick, i dati di ogni partita, i consigli automatici, i riepiloghi per i progressi, la ricerca della sens, lo stato. Senza DOM, testato in `tests/aim.test.js`. |
| `aim/game.js` | Il gioco: stanza 3D disegnata su canvas, mouse bloccato con input grezzo (Pointer Lock con `unadjustedMovement` dove il browser lo permette), A/D o frecce per muoversi nel counter-strafe, mirino in stile Valorant, HUD, fasi della prova sens, suoni; misura del giro di 360 gradi. |
| `aim/ui.js`, `aim/aim.css` | La pagina: Allenamento (livelli per esercizio, routine del giorno di 7 esercizi, circa 9 minuti), risultato con tutti i dati, Trova la sens, Progressi (calendario, abilità, grafici per ogni dato, analisi, confronto per sens, tutte le partite), Impostazioni (DPI, sens, mirino, colori, suoni). |

**Sensibilità identica al gioco**: ogni unità di movimento letta dal browser gira la visuale di sens × 0,07 gradi. Con Chrome o Edge l'accelerazione del sistema viene disattivata; per essere sicuri c'è la verifica del 360: si fa un giro completo in Valorant segnando il tappetino, poi lo stesso movimento qui, e l'app corregge lo scarto.

**Dati di ogni partita**: precisione, colpi mancati, tempi (media, mediana, migliore, irregolarità), come arrivi sul bersaglio (flick puliti, oltre e corretti, corti e corretti; colpi mancati oltre, corti o di lato), flick per distanza (corti, medi, lunghi), punto medio dei colpi rispetto al centro, andamento dentro la partita; in più per esercizio: errore in altezza, colpi in movimento e tempo da fermo allo sparo, colpi sul muro, duelli persi e colpi dietro/davanti, tempo addosso, dietro/davanti e riaggancio nel tracking, partenze anticipate.

**Livelli**: Base, Avanzato, Pro (bersagli più piccoli, più lontani, tempi più stretti). Record e medie sono separati per livello; quando le ultime 3 partite superano la soglia (precisione 90%, riusciti 85%, tempo addosso 65%) l'app propone di salire.

**Trova la sens**: confronti a coppie alla cieca (Sens 1 e Sens 2, valori svelati dopo la scelta) su scala logaritmica attorno alla sens attuale (da ÷1,6 a ×1,6), 4 turni; a ogni turno si tiene la metà con la sens migliore. Ogni prova dura 40 secondi in tre fasi (flick lunghi e corti, precisione su bersagli piccoli, tracking) con gli stessi bersagli per le due sens. Versione precisa (ordine 1-2-2-1, ogni sens provata due volte) o rapida; riscaldamento iniziale che non conta. Il consiglio unisce punteggio (pesa di più), sensazione (lenta, giusta, veloce) e come arrivi sul bersaglio (spesso oltre = sens alta, spesso corto = sens bassa); sceglie l'utente. Le ricerche fatte restano salvate e l'app propone la media delle ultime 3.

## Modulo difesa: arti marziali "metodo Johan Seong"

La scheda **Arti marziali** è la parte principale della pagina Difesa. Il tema è Johan Seong di Lookism, che copia una tecnica dopo averla vista una volta: qui diventa un metodo reale in quattro passi (osserva, copia, ripeti, fallo tuo). I riferimenti al webtoon sono solo testi con fatti verificati, niente immagini dei personaggi.

| File | Cosa fa |
|---|---|
| `defense/martial-data.js` | 9 discipline (boxe, muay thai, taekwondo, karate, capoeira, lotta, Wing Chun, systema, sambo), 6 livelli ciascuna. Ogni livello: riscaldamento, 3 sessioni (impara, ripeti, prova del livello), defaticamento. Ogni esercizio: obiettivo, cosa guardare nel video, passi, punti chiave, errori tipici con la correzione, criterio di "riuscito" misurabile, versione più facile e più difficile, cosa fare senza sacco, note di sicurezza, preparatori prima delle tecniche difficili o di flessibilità, round con un compito per round, ricerca video su YouTube. |
| `defense/martial-lookism.js` | Riferimenti a Lookism: il metodo, chi usa quale stile nel webtoon e cosa copiarne, la scheda "In Lookism" degli stili, i ranghi. |
| `defense/martial.js` | Settimana a rotazione, livelli, rotazione delle sessioni, storico. Senza DOM, testato in `tests/martial.test.js`. |
| `defense/martial-ui.js`, `defense/martial.css` | Le viste Oggi, Settimana, Stili, Lookism, Progressi. |

**Settimana**: di base 5 giorni (lunedì-venerdì, modificabili). Ogni giorno uno stile diverso; le discipline cambiano di settimana in settimana (prima quelle che non fai da più tempo). Lo stile di oggi si cambia con un tocco dalla vista Oggi, gli altri giorni dal loro menu nel calendario. Gli stili si possono togliere dalla rotazione.

**Allenamento**: le sessioni del livello ruotano (impara → ripeti → prova); oggi puoi sceglierne un'altra con un tocco. Ogni esercizio ha il timer (serie a tempo o a ripetizioni, recupero, cambio lato, compito del round annunciato a voce, segnali casuali per shadow e sacco). Per ogni esercizio segni "Riuscito" o "Non ancora". Dopo la prova l'app consiglia di salire se hai almeno l'80% riuscito, ma decidi sempre tu; puoi salire anche dopo una sessione normale. All'ultimo livello si può dichiarare lo stile "copiato al 100%". Il livello si cambia con un tocco anche dalla scheda dello stile.

**Progressi**: settimana in corso, settimane complete di fila, allenamenti e minuti, quanto hai copiato di ogni stile, prove superate, calendario delle ultime 8 settimane, cambi di livello e ultimi allenamenti. Il rango (vista Lookism) è la media di quanto hai copiato di tutti gli stili. Gli allenamenti contano anche per Tecnica e Costanza nel profilo della Difesa.

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
node tests/aim.test.js
node tools/verify-lessons.js           # controlla esempi ed esercizi delle lezioni con Stockfish
node tools/calibrate.js self:8 6       # precisione media del livello 8 su 6 partite bot contro bot
node tools/calibrate.js match:10-12 10 # scontro diretto tra due livelli
```
