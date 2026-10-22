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
- **Rating partite**: Glicko-1 contro i bot (ogni bot ha un Elo misurato contro Stockfish, vedi "Come gioca il bot"). Contano solo le partite *valutate* (niente suggerimenti, niente mosse annullate) di almeno 8 mosse.
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
Stockfish trova le mosse migliori e le valuta. Per ogni mossa il bot decide, con probabilità fissate per il suo livello, se giocare bene oppure commettere un'imprecisione, un errore o un blunder; l'errore viene scelto tra le mosse che perdono proprio quella quota di probabilità di vittoria.

Gli errori sono **credibili**: dai livelli intermedi in su il bot sbaglia solo con mosse che sembrano buone a un calcolo corto (la sua "visione", da 1 a 6 mezze mosse) ma perdono a un calcolo più lungo. È la svista tipica di una persona: non lascia un pezzo in presa senza motivo, manca la tattica che non ha visto. I principianti invece lasciano anche pezzi in presa. Con la partita già vinta il bot sbaglia meno e chiude. I livelli 18 e 19 giocano a piena forza.

**Taratura (ottobre 2026).** Ogni livello ha giocato contro Stockfish 17.1 completo con forza limitata (`UCI_LimitStrength` / `UCI_Elo`): è la scala Elo ufficiale di Stockfish, da 1320 a 3190, tarata dagli sviluppatori sulla lista CCRL Blitz. L'Elo scritto sul bot è quello misurato su quella scala; sotto 1320 i livelli sono misurati a catena, uno contro l'altro. Le scale umane non coincidono del tutto (Lichess dà numeri più alti di chess.com, chess.com più alti della FIDE), quindi il numero va letto come "circa". Strumento: `tools/calibrate.js`.

Le partite di taratura partono dalla posizione iniziale, come nell'app (il bot gioca anche la sua apertura).

| Livello | Elo scritto | Misurato | Come |
|---|---|---|---|
| 1-5 | 250, 400, 550, 700, 850 | circa come scritto (±100) | a catena, 50 partite tra livelli vicini |
| 6-8 | 1000, 1150, 1300 | 900, 1260, 1275 | 24 partite contro Stockfish 1320 |
| 9-12 | 1450, 1600, 1800, 2000 | 1480, 1645, 1890, 2000 | 24 partite contro Stockfish allo stesso Elo |
| 13-15 | 2200, 2400, 2600 | 2230, 2520, 2600 | come sopra |
| 16-17 | 2800, 3000 | 2910, 3045 | 16 partite contro Stockfish allo stesso Elo |
| 18 | 3200 | oltre 3200 | 10 vinte su 10 contro Stockfish 3000 |
| 19 | 3600 | non misurabile | sopra la scala di Stockfish, è il più forte |

Con 24 partite l'incertezza è di circa ±100 punti. La forza interna di ogni livello viene da una curva costruita su tutte le partite giocate (più di 3500).

I bot di prima (fino al 21 ottobre 2026) erano più deboli dell'Elo scritto e ogni tanto regalavano un pezzo anche ai livelli alti. Misurati allo stesso modo: il "1300" valeva circa 870, il "2000" circa 1790, il "3000" circa 2650. Al primo avvio dopo l'aggiornamento il rating delle partite già giocate viene ricalcolato con la loro forza vera (i dati vecchi restano salvati) e le statistiche per livello ripartono da zero.

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
| `culture/ui.js`, `culture/culture.css` | La pagina: Biblioteca, Ripasso, Università, Profilo. |
| `culture/university.js` | I corsi della mini università, uno per facoltà (psicologia, neuroscienze, economia, finanza, strategia e teoria dei giochi, filosofia, storia, informatica, matematica, fisica), ognuno costruito su un corso aperto e gratuito (MIT OpenCourseWare, Open Yale Courses, Harvard): link alle lezioni originali, spiegazioni in italiano scritte per l'app (riassunti, non traduzioni), punti chiave, glossario, quiz, "spiegalo con parole tue" ed esercizio pratico. |
| `culture/uni-engine.js` | Motore dell'università: lezioni superate dal 60%, ripasso distanziato, esame finale in trentesimi, libretto. Senza DOM, testato in `tests/university.test.js`. |
| `culture/uni-ui.js` | La scheda Università: corsi, lezione (video originale, spiegazione, verifica, spiegalo tu), ripasso, esame, libretto. |

**Studio**: leggi la scheda, rispondi a 5 domande (dato, comprensione, applicazione, collegamento) con la spiegazione subito dopo, poi scrivi la spiegazione con parole tue e la confronti con il modello. Con 4 o 5 risposte giuste la scheda torna in ripasso dopo 3 giorni, altrimenti il giorno dopo.

**Ripasso**: ogni scheda in scadenza propone 2 domande (prima quelle sbagliate in passato). Tutte giuste: il ripasso successivo si allontana (1, 3, 7, 16, 35 giorni); tutte sbagliate: torna al giorno dopo.

**Università**: ogni lezione si apre con il link alla lezione originale (video o appunti, in inglese), poi la spiegazione in italiano, i punti chiave e il glossario; la verifica (4-6 domande con la spiegazione subito dopo) si supera con il 60%, poi si scrive la spiegazione con parole proprie e si confronta con i punti chiave. Le lezioni superate tornano in ripasso (2 domande) dopo 1, 3, 7, 16, 35 giorni. Finite le lezioni di un corso si dà l'esame: 12 domande da tutte le lezioni, senza aiuti, voto in trentesimi (8 giuste su 12 valgono 18, ogni risposta in più 3 punti, tutto giusto 30 e lode); si può ripetere e sul libretto resta il voto migliore, con crediti e media.

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
| `aim/engine.js` | Calcoli della sensibilità come in Valorant (0,07 gradi per unità di movimento a sens 1, campo visivo orizzontale 103 gradi, eDPI, cm/360), calibrazione del mouse, proiezione 3D e colpi, gli 8 scenari con 3 livelli (Gridshot, Precisione, Linea della testa, Counter-strafe, Peek dagli angoli, Duelli ADAD, Tracking ADAD, Riflessi), i 4 esercizi da cecchino (Flick con lo scope, Tieni l'angolo, Marshal alla testa, Quickscope) con i dati di Operator, Marshal e Outlaw, più la Prova sensibilità a tre fasi, l'analisi dei flick, i dati di ogni partita, i consigli automatici, i riepiloghi per i progressi, la ricerca della sens, lo stato. Senza DOM, testato in `tests/aim.test.js`. |
| `aim/game.js` | Il gioco: stanza 3D disegnata su canvas, mouse bloccato con input grezzo (Pointer Lock con `unadjustedMovement` dove il browser lo permette), A/D o frecce per muoversi nel counter-strafe, scope con il tasto destro (campo visivo diviso per lo zoom, sens nello scope = sens × moltiplicatore / zoom, caricamento tra un colpo e l'altro), mirino in stile Valorant, HUD, fasi della prova sens, suoni; misura del giro di 360 gradi. |
| `aim/ui.js`, `aim/aim.css` | La pagina: Allenamento (livelli per esercizio, routine del giorno di 7 esercizi, circa 9 minuti), Cecchino (routine di 4 esercizi, sens nello scope, confronto dei fucili con le fonti, consigli), risultato con tutti i dati, Trova la sens, Progressi (calendario, abilità, grafici per ogni dato, analisi, confronto per sens, tutte le partite), Impostazioni (DPI, sens, mirino, colori, suoni). |

**Sensibilità identica al gioco**: ogni unità di movimento letta dal browser gira la visuale di sens × 0,07 gradi. Con Chrome o Edge l'accelerazione del sistema viene disattivata; per essere sicuri c'è la verifica del 360: si fa un giro completo in Valorant segnando il tappetino, poi lo stesso movimento qui, e l'app corregge lo scarto.

**Dati di ogni partita**: precisione, colpi mancati, tempi (media, mediana, migliore, irregolarità), come arrivi sul bersaglio (flick puliti, oltre e corretti, corti e corretti; colpi mancati oltre, corti o di lato), flick per distanza (corti, medi, lunghi), punto medio dei colpi rispetto al centro, andamento dentro la partita; in più per esercizio: errore in altezza, colpi in movimento e tempo da fermo allo sparo, colpi sul muro, duelli persi e colpi dietro/davanti, tempo addosso, dietro/davanti e riaggancio nel tracking, partenze anticipate.

**Livelli**: Base, Avanzato, Pro (bersagli più piccoli, più lontani, tempi più stretti). Record e medie sono separati per livello; quando le ultime 3 partite superano la soglia (precisione 90%, riusciti 85%, tempo addosso 65%) l'app propone di salire.

**Trova la sens**: confronti a coppie alla cieca (Sens 1 e Sens 2, valori svelati dopo la scelta) su scala logaritmica attorno alla sens attuale (da ÷1,6 a ×1,6), 4 turni; a ogni turno si tiene la metà con la sens migliore. Ogni prova dura 40 secondi in tre fasi (flick lunghi e corti, precisione su bersagli piccoli, tracking) con la stessa sequenza di bersagli per le due sens. Versione precisa (ordine 1-2-2-1, ogni sens provata due volte) o rapida; riscaldamento iniziale che non conta. Il consiglio unisce punteggio (pesa di più), sensazione (vince quella giudicata giusta contro una lenta o veloce) e come arrivi sul bersaglio (vince quella con le correzioni più equilibrate, non sempre oltre o sempre corte), senza svelare quale sens è la più alta; sceglie l'utente. Le ricerche fatte restano salvate e l'app propone la media delle ultime 3, calcolata sull'eDPI (vale anche se cambi i DPI).

**Cecchino**: tasto destro per lo scope (a scatti come in Valorant: con l'Operator il primo clic è 2,5x, il secondo 5x, il terzo esce; oppure tenendo premuto). Il campo visivo con lo zoom è 103° diviso l'ingrandimento e la sens nello scope è sens × moltiplicatore / zoom, come in Valorant con lo Scoped Sensitivity Multiplier (1 = predefinito). Dopo ogni colpo si esce dallo scope e il fucile si ricarica (Operator 0,6 colpi al secondo, Marshal 1,5). Senza scope il colpo va quasi a caso; nell'app lo scope entra in 0,15 secondi e un colpo sparato prima è storto. I nemici hanno 150 punti: l'Operator uccide con testa o busto (gambe 120), il Marshal solo con la testa (busto 101, due colpi bastano). Danni, prezzi e zoom controllati a ottobre 2026, con le fonti nella pagina.

**Dati importati**: allo stato della mira (anche da un file di backup) restano solo numeri e valori previsti, così nella pagina non può finire codice.

## Modulo difesa: arti marziali "metodo Johan Seong"

La scheda **Arti marziali** è la parte principale della pagina Difesa. Il tema è Johan Seong di Lookism, che copia una tecnica dopo averla vista una volta: qui diventa un metodo reale in quattro passi (osserva, copia, ripeti, fallo tuo). I riferimenti al webtoon sono solo testi con fatti verificati, niente immagini dei personaggi.

| File | Cosa fa |
|---|---|
| `defense/martial-data.js` | 9 discipline (boxe, muay thai, taekwondo, karate, capoeira, lotta, Wing Chun, systema, sambo), 6 livelli ciascuna. Ogni livello: riscaldamento, 3 sessioni (impara, ripeti, prova del livello), defaticamento. Ogni esercizio: obiettivo, cosa guardare nel video, passi, punti chiave, errori tipici con la correzione, criterio di "riuscito" misurabile, versione più facile e più difficile, cosa fare senza sacco, note di sicurezza, preparatori prima delle tecniche difficili o di flessibilità, round con un compito per round, ricerca video su YouTube. |
| `defense/martial-lookism.js` | Riferimenti a Lookism: il metodo, chi usa quale stile nel webtoon e cosa copiarne, la scheda "In Lookism" degli stili, i ranghi. |
| `defense/martial.js` | Settimana a rotazione, livelli, rotazione delle sessioni, storico. Senza DOM, testato in `tests/martial.test.js`. |
| `defense/martial-ui.js`, `defense/martial.css` | Le viste Oggi, Settimana, Stili, Lookism, Progressi. |
| `defense/figure3d.js` | L'omino 3D: scheletro con cinematica inversa a due ossa (gomiti e ginocchia piegati verso una direzione), quattro viste (3/4, lato, fronte, da dietro), disegno SVG con il lato vicino chiaro, quello lontano più scuro e la parte che lavora in ambra, frecce del movimento, sacco e compagno; il lettore animato (riproduci, passo per passo, ripeti un passo, al rallentatore, trascina per girare l'omino); il controllo delle pose impossibili. |
| `defense/moves.js` | Il costruttore delle pose (guardie, colpi dritti, ganci, montanti, gomitate, parate, calci con caricamento ed estensione, posizioni a terra, specchio per l'altro lato), le posizioni di base dei 9 stili e il registro dei movimenti; da una lista di passi crea la dimostrazione e sceglie le immagini della sequenza. |
| `defense/moves/*.js` | I movimenti: `comuni.js` (riscaldamento, condizionamento, allungamenti, respirazione, cadute) e uno per stile. |
| `defense/martial-demos.js` | Per ogni esercizio, una riga per passo: didascalia e movimenti da mostrare. |

**Settimana**: di base 5 giorni (lunedì-venerdì, modificabili). Ogni giorno uno stile diverso; le discipline cambiano di settimana in settimana (prima quelle che non fai da più tempo). Lo stile di oggi si cambia con un tocco dalla vista Oggi, gli altri giorni dal loro menu nel calendario. Gli stili si possono togliere dalla rotazione.

**Allenamento**: le sessioni del livello ruotano (impara → ripeti → prova); oggi puoi sceglierne un'altra con un tocco. Ogni esercizio ha il timer (serie a tempo o a ripetizioni, recupero, cambio lato, compito del round annunciato a voce, segnali casuali per shadow e sacco). Per ogni esercizio segni "Riuscito" o "Non ancora". Dopo la prova l'app consiglia di salire se hai almeno l'80% riuscito, ma decidi sempre tu; puoi salire anche dopo una sessione normale. All'ultimo livello si può dichiarare lo stile "copiato al 100%". Il livello si cambia con un tocco anche dalla scheda dello stile.

**L'omino che mostra come si fa**: in ogni esercizio, sotto "Come si fa", c'è il video dell'omino che esegue tutti i passi uno dopo l'altro, con la didascalia del passo; accanto a ogni passo c'è la sequenza di immagini delle mosse (tocca un'immagine per fermare il video lì, tocca ▶ per ripetere solo quel passo). L'omino si guarda da quattro lati o si gira trascinandolo. Con "riduci movimento" attivo nel sistema il video non parte da solo.

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

## Modulo memoria: misura, tecniche, discipline da gara

La pagina Memoria (cartella `memory/`) ha tre parti: test classici per misurare la memoria con valori di riferimento pubblicati, le tecniche dei campioni di memoria con esercizi, e le discipline delle gare a livelli. Ogni giorno propone un programma breve (immagini del sistema fonetico, una disciplina a rotazione, il palazzo della memoria); i test si rifanno una volta al mese.

| File | Cosa fa |
|---|---|
| `memory/data.js` | 401 parole concrete italiane, nomi e cognomi, le 100 immagini del sistema fonetico 00-99 (ognuna controllata con la conversione fonetica). |
| `memory/faces.js` | Volti SVG generati da un numero (sempre lo stesso volto per lo stesso numero). |
| `memory/engine.js` | Test di span, lista di parole con richiamo differito, valori di riferimento e percentili, discipline e punteggio, palazzi, sistema fonetico con ripasso distanziato, programma del giorno, profilo. Senza DOM, testato in `tests/memory.test.js`. |
| `memory/ui.js`, `memory/memory.css` | La pagina: Oggi, Misura, Tecniche, Discipline, Progressi. |

**Misura**: span di cifre in avanti e all'indietro (da 2 cifre, 2 sequenze per lunghezza, basta una giusta per salire: la procedura delle norme italiane del 2025, 225 adulti, media 5,30 ± 1,16 in avanti e 4,54 ± 1,23 all'indietro); blocchi di Corsi in avanti e all'indietro (un blocco al secondo acceso per mezzo secondo, come eCorsi di Brunetti e colleghi 2014: adulti giovani 6,11 ± 0,80 e 5,29 ± 1,20, anziani a parte; tavola con la disposizione approssimata dell'originale presa dal plugin corsi-blocks di jsPsych); lista di 15 parole sul modello della prova di Rey (5 prove, lista di disturbo, richiamo della prima lista, richiamo dopo 20 minuti; confronto con Magalhães e Hamdan 2010 e Alviarez-Schulze e colleghi 2022, per fascia d'età se la inserisci). Il risultato è un percentile con la fonte e le differenze di procedura scritte accanto (cifre lette invece che ascoltate, liste di parole diverse da quella originale): è un termometro, non una diagnosi.

**Tecniche**: raggruppare, storia, palazzo della memoria (con editor dei palazzi e allenamento), sistema fonetico italiano (0 S/Z/SC dolce, 1 T/D, 2 N/GN, 3 M, 4 R, 5 L/GL, 6 C/G dolci, 7 C/G dure/Q/K, 8 F/V, 9 P/B; conta il suono, le doppie valgono una), nomi e volti, ripasso distanziato. Ogni tecnica spiega perché funziona con i numeri degli studi e il link alla fonte (Cowan 2001, Chase ed Ericsson 1982, Dresler e colleghi 2017, Cepeda e colleghi 2006, Roediger e Karpicke 2006). Le 100 immagini del sistema fonetico si imparano 10 al giorno con le scatole di Leitner (1, 2, 4, 8, 16, 32 giorni; una sbagliata torna dopo 10 minuti).

**Discipline**: numeri, parole, carte, nomi e volti, 10 livelli ciascuna; l'ultimo è il formato di Memory League (1 minuto per memorizzare 80 cifre, 50 parole, un mazzo o 30 nomi). Numeri e parole si contano con la regola delle gare IAM a righe da 10 (riga perfetta = tutti i punti, un errore = metà arrotondata per eccesso, due o più = zero; i buchi in una riga completa sono errori; l'ultima riga scritta vale fino all'ultima risposta). Carte e nomi: un punto per risposta giusta. Il livello successivo si sblocca con il 90% e sei tu a decidere quando salire. Dopo ogni turno l'app mostra i record IAM per avere un'idea della scala.

**Profilo (6 categorie)**: Memoria di lavoro (percentile medio degli span di cifre fatti), Memoria visiva (Corsi), Richiamo verbale (lista di parole e richiamo differito), Tecnica (immagini del sistema fonetico imparate e uso dei palazzi), Discipline (livello raggiunto), Costanza (giorni di allenamento nelle ultime due settimane). Senza misure né allenamenti le prime cinque partono da 35. Allenare la memoria migliora i compiti allenati; le meta-analisi (Melby-Lervåg e colleghi 2013 e 2016) non trovano effetti sull'intelligenza generale, e la pagina lo dice.

## Modulo influenza: persuasione, trattativa, manipolazione

La pagina Influenza (cartella `influence/`) insegna la psicologia della persuasione con gli esperimenti originali, la allena con esercizi misurabili e insegna a riconoscere la manipolazione. Persuasione, negoziazione e strategia si allenano per usarle; le tattiche manipolative (gaslighting, DARVO, love bombing, isolamento…) si studiano solo per riconoscerle e neutralizzarle quando le usano su di te.

| File | Cosa fa |
|---|---|
| `influence/tactics.js` | Catalogo di 36 leve e tattiche in quattro famiglie (leve di persuasione, cornici e bias, negoziazione, manipolazione), ognuna con definizione e contromossa. |
| `influence/data.js` | Il manuale: 7 capitoli (le leve del sì, le tecniche in sequenza, cornici e bias, trattare, leggere le persone, strategia sociale, manipolazione e difesa), con gli esperimenti, i numeri e le fonti. |
| `influence/deals.js` | Gli scenari della trattativa (gres per un cantiere, magazzino, furgone, fornitore, parquet, container per Jakarta, stipendio), le 5 controparti e le loro battute. |
| `influence/drills.js` | Gli esercizi: messaggi in cui riconoscere la tattica e casi a scelta (lavoro, vita di tutti i giorni, esami speciali, difesa). |
| `influence/engine.js` | Simulatore di trattativa, schede a ripasso distanziato, riconoscimento, casi, programma del giorno, profilo. Senza DOM, testato in `tests/influence.test.js`. |
| `influence/ui.js`, `influence/influence.css` | La pagina: Oggi, Manuale, Allenamento, Trattativa, Progressi. |

**Trattativa**: la controparte ha un limite nascosto (estratto a caso a ogni partita), una personalità (Collaborativo, Pragmatico, Duro, Ancorante, Bluffatore: 5 livelli, il successivo si sblocca con il 60%) e un interesse nascosto su un secondo punto (pagamento, durata, garanzia, posa, resa, smart working) che a te costa poco e a lei vale molto. Le mosse: offerta (con un criterio oggettivo per motivarla), domanda calibrata, domanda chiusa, etichetta, dichiarare la tua alternativa (vera o un bluff), ultima offerta, fare a metà, accettare, alzarsi. La controparte concede nel tempo (più lenta se è dura), ricambia le tue concessioni, si fa ancorare da una prima offerta ambiziosa ma credibile (di più se è motivata e precisa), si offende davanti a cifre fuori mercato, a volte scopre i bluff, e non accetta mai oltre il suo limite. Il risultato è il **valore catturato**: quanto dello spazio tra la tua alternativa e il massimo che avrebbe accettato (con il secondo punto migliore) hai portato a casa. A volte lo spazio non c'è (12% delle partite dopo le prime due): allora non chiudere vale il 100%. Alla fine si scopre il limite sulla linea del prezzo e un'analisi dice cosa ha funzionato (ancora, concessioni, interesse trovato, bluff). Il simulatore è stato provato con strategie automatiche: chi accetta subito cattura in media meno del 10%, chi fa a metà circa il 40% contro un collaborativo e quasi niente contro un ancorante, una strategia brava (ancora motivata, etichetta, secondo punto, concessioni decrescenti) intorno al 60-65% contro i primi livelli.

**Allenamento**: riconoscere la leva in messaggi veri (10 per turno; le sbagliate tornano subito, le giuste dopo 2, 7, 21 giorni), difesa dalla manipolazione, casi con quattro mosse valutate per efficacia, relazione e rischio (punteggio = 0,5 × efficacia + 0,3 × relazione + 0,2 × (100 − rischio); la mossa migliore vale 100), schede con definizione e contromossa di ogni tattica a ripasso distanziato (6 nuove al giorno, scatole a 1, 2, 4, 8, 16, 32 giorni).

**Profilo (6 categorie)**: Riconoscimento (risposte giuste sulle ultime 60 leve, bias e tecniche di trattativa), Persuasione (media dei casi), Negoziazione (valore catturato nelle ultime 8 trattative, pesato per livello), Difesa (messaggi di manipolazione e casi di difesa), Conoscenza (schede imparate e capitoli letti), Costanza (giorni di allenamento nelle ultime due settimane). Con pochi dati partono da 35 e si avvicinano al dato vero man mano.

## Modulo logica: esercizi generati, punteggio per disciplina, trappole

La pagina Logica (cartella `logic/`) genera gli esercizi al momento, quindi non finiscono mai, e controlla con un risolutore che ognuno abbia una sola soluzione.

| File | Cosa fa |
|---|---|
| `logic/gen.js` | I generatori: matrici in stile Raven (forma, numero, grandezza e colore con regole costante/progressione/distribuzione; ai livelli alti sovrapposizioni XOR), serie di numeri (scartate quelle che un'altra regola semplice continuerebbe diversamente), griglie di deduzione (case in fila; indizi aggiunti finché la soluzione è unica, poi tolti quelli inutili), cavalieri e furfanti (soluzione unica su tutte le combinazioni), sillogismi (validità controllata su tutti i modelli a tre insiemi non vuoti), probabilità (dadi, monete, carte, Bayes, valore atteso, compleanni), riflessione (problemi tipo test di Frederick con numeri sempre nuovi). |
| `logic/traps.js` | 14 trappole classiche con i dati degli studi originali: test di riflessione cognitiva (Frederick 2005; Thomson e Oppenheimer 2016), Wason astratto e versione del bar, Linda, taxi, test medico, tre porte, due ospedali, roulette. |
| `logic/data.js` | 8 lezioni di metodo: dedurre/indurre/abdurre, condizionale, quantificatori e sillogismi, griglie, matrici e serie, probabilità, riflessione, cosa si trasferisce nella vita vera. |
| `logic/engine.js` | Punteggio per disciplina, turni, controllo delle risposte, trappole, programma del giorno, profilo a esagono. Senza DOM, testato in `tests/logic.test.js`. |
| `logic/ui.js`, `logic/logic.css` | La pagina: Oggi, Allenamento, Trappole, Metodo, Progressi. |

**Punteggio**: ogni disciplina ha un punteggio come l'Elo degli scacchi. Ogni esercizio ha una difficoltà calcolata dalla frazione p di partecipanti tipici che lo risolvono: difficoltà = 1000 + 400 × log10((1 − p)/p), quindi 1000 = lo risolve una persona su due. Dopo ogni risposta il punteggio cambia di K × (risultato − probabilità attesa), con K 40, poi 28, poi 20. Il livello automatico sceglie esercizi un po' sotto il tuo punteggio (circa 6 giuste su 10). Un test controlla che, con risposte simulate, il punteggio arrivi vicino al livello vero.

**Da dove vengono le difficoltà**: matrici dai dati aperti di Matzen e colleghi 2010 (una regola 87-94% di risposte giuste, due 75-85%, tre 55-74%, XOR 34%), con le 8 risposte costruite come in I-RAVEN (Hu e colleghi 2021: ogni caratteristica giusta compare in metà delle risposte, così non si indovina per esclusione); sillogismi ai livelli 3-4 dai dati aperti di Ragni e colleghi 2016 (139 persone, tutti i 64 sillogismi: dal 4% di «nessun A è B; tutti i B sono C» all'88% di «tutti gli A sono B; nessun B è C», media 41%); riflessione dai campioni del test di Frederick (racchetta 30-48%, macchine 30-44%, ninfee 42-54%) e del test 2 (gara 63%). Per serie, griglie, cavalieri e il resto della probabilità non esistono norme pubblicate: le difficoltà sono stime coerenti tra loro, e la pagina non presenta i punteggi come un QI.

**Profilo (6 categorie, esagono)**: Ragionamento astratto (matrici), Serie e pattern, Deduzione (griglie), Logica formale (sillogismi e cavalieri), Probabilità, Riflessione (disciplina più trappole al primo tentativo). Punteggio 1000 = 50 nell'esagono; con pochi esercizi le categorie partono da 35.

## Test

```powershell
node tests/chess-core.test.js
node tests/chess-trainer.test.js
node tests/scenarios.test.js
node tests/culture.test.js
node tests/defense.test.js
node tests/martial.test.js
node tests/omino.test.js
node tests/university.test.js
node tests/aim.test.js
node tests/memory.test.js
node tests/influence.test.js
node tests/logic.test.js
node tools/verify-lessons.js           # controlla esempi ed esercizi delle lezioni con Stockfish
node tools/calibrate.js sf:8,12 30     # livelli 8 e 12 contro Stockfish con forza limitata all'Elo del livello
node tools/calibrate.js match:3-4 50   # scontro diretto tra due livelli (per quelli sotto 1320)
```
