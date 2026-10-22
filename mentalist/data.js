/*
 * Progetto A - Mentalista: il metodo (lezioni con fonti verificate, senza DOM).
 * Ogni lezione: sezioni brevi, un esempio, le fonti e due domande di verifica (conta la prima
 * risposta). Le citazioni di Sherlock Holmes sono di Arthur Conan Doyle (pubblico dominio):
 * originale inglese e traduzione nostra.
 */
(function (root) {
  "use strict";

  const LESSONS = [
    {
      id: "observe", title: "Vedere non è osservare", minutes: 7, train: "kim",
      lead: "Jane sembra leggere nel pensiero. In realtà guarda quello che tutti hanno davanti agli occhi e quasi nessuno nota. Si impara, ma prima bisogna sapere quanto poco vediamo.",
      sections: [
        {
          title: "Quanto ci sfugge",
          body: [
            "«You see, but you do not observe. The distinction is clear.» «Tu vedi, ma non osservi. La differenza è chiara.» Lo dice Sherlock Holmes a Watson in «Uno scandalo in Boemia» (1891): Watson ha salito mille volte le scale di Baker Street e non sa quanti gradini sono.",
            "La psicologia gli ha dato ragione. Nel 1999 Simons e Chabris hanno chiesto di contare i passaggi in un video di basket: nel complesso circa metà dei partecipanti (46%) non ha notato un evento inatteso, una persona con un ombrello o un uomo travestito da gorilla che attraversa la scena. Le percentuali cambiano molto da una versione all'altra dell'esperimento.",
            "Nel 1998 Simons e Levin hanno fatto chiedere indicazioni a dei passanti; durante la conversazione due operai passavano in mezzo con una porta e chi chiedeva veniva sostituito da un'altra persona. Su 15 passanti, 8 non si sono accorti di parlare con una persona diversa.",
            "Nemmeno gli esperti sono immuni: in uno studio del 2013, 20 radiologi su 24 (83%) non hanno visto un gorilla 48 volte più grande dei noduli che stavano cercando in una TAC dei polmoni, e molti lo avevano guardato dritto."
          ]
        },
        {
          title: "Come si osserva davvero",
          body: [
            "L'attenzione va dove la mandi. Per questo chi osserva bene usa una lista fissa, sempre nello stesso ordine, invece di guardare «in generale». Per una persona: mani (calli, unghie, segni), scarpe (usura, pulizia), vestiti (qualità, consumo, macchie), accessori (orologio, anelli, segni di quelli che mancano), e alla fine quello che stona con il resto.",
            "Per un luogo: prima com'è di solito, poi che cosa è fuori posto, che cosa manca, che cosa è troppo pulito o troppo in ordine. Il dettaglio che non dovrebbe esserci vale più di dieci che ci si aspetta.",
            "Il gioco di Kim viene da qui. Nel romanzo «Kim» di Kipling (1901) il ragazzo viene allenato a ricordare un vassoio di gioielli visto per pochi istanti; nel 1908 Baden-Powell lo mise in «Scouting for Boys»: venti o trenta piccoli oggetti su un vassoio, scoperti per un minuto, vince chi ne ricorda di più."
          ],
          example: { q: "Watson ha visto le scale migliaia di volte. Perché non sa quanti gradini sono?", a: "Perché non ha mai avuto un motivo per contarli: l'occhio registra, ma l'attenzione non si è mai posata lì. Osservare vuol dire decidere che cosa guardare." }
        }
      ],
      sources: [
        ["Simons e Chabris (1999), Perception 28(9): Gorillas in our midst", "https://journals.sagepub.com/doi/10.1068/p281059"],
        ["Simons e Levin (1998), Psychonomic Bulletin & Review 5(4)", "https://gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/1998-simons.pdf"],
        ["Drew, Võ e Wolfe (2013), Psychological Science: il gorilla e i radiologi", "https://www.psychologicalscience.org/journals/psychological-science/0956797613479386/"],
        ["Conan Doyle, A Scandal in Bohemia (1891), Project Gutenberg", "https://gutenberg.org/files/1661/1661-h/1661-h.htm"],
        ["Baden-Powell, Scouting for Boys (1908), Project Gutenberg", "https://gutenberg.org/cache/epub/65993/pg65993-images.html"]
      ],
      checks: [
        { q: "Nello studio del 2013, quanti radiologi non hanno visto il gorilla nella TAC?", options: ["Quasi nessuno: sono esperti", "Circa uno su cinque", "Più di otto su dieci", "Tutti"], answer: 2, why: "20 su 24, l'83%. Essere esperti aiuta a trovare quello che si cerca, non quello che non ci si aspetta." },
        { q: "Qual è il modo più affidabile di osservare una persona?", options: ["Fissarla negli occhi per capire se è sincera", "Una lista fissa: mani, scarpe, vestiti, accessori, e alla fine ciò che stona", "Fidarsi della prima impressione", "Concentrarsi solo sul linguaggio del corpo"], answer: 1, why: "La lista fissa costringe l'attenzione a passare dove da sola non andrebbe." }
      ]
    },
    {
      id: "pieces", title: "Mettere insieme i pezzi", minutes: 8, train: "liar",
      lead: "Jane non «deduce» come in un sillogismo: mette insieme indizi e sceglie la spiegazione che li spiega tutti. Si chiama abduzione, ed è potente proprio perché può sbagliare.",
      sections: [
        {
          title: "Deduzione, induzione, abduzione",
          body: [
            "Deduzione: se le premesse sono vere, la conclusione lo è per forza. «Solo tre persone hanno la chiave; due erano altrove: è stata la terza.»",
            "Induzione: da tanti casi a una regola. «Ogni volta che ha mentito, si è contraddetto sugli orari.»",
            "Abduzione: dagli indizi alla spiegazione migliore. «Abbronzatura sul viso ma non sui polsi, un braccio rigido: viene da un paese caldo, è stato ferito.» Le famose «deduzioni» di Holmes sono quasi sempre abduzioni: spiegazioni brillanti, ma che potrebbero essere sbagliate."
          ]
        },
        {
          title: "Il metodo",
          body: [
            "«It is a capital mistake to theorise before one has data.» «È un errore capitale fare teorie prima di avere i dati: senza accorgersene si comincia a piegare i fatti alle teorie, invece delle teorie ai fatti.» (Holmes, «Uno scandalo in Boemia».) Prima si raccolgono i fatti, separandoli dalle interpretazioni: «la busta era nel bidone» è un fatto, «l'ha buttata il cuoco» è un'ipotesi.",
            "Poi si mettono in fila con gli orari. Una linea del tempo fa saltare fuori da sola i buchi e le contraddizioni: chi dice di essere andato via alle 23:30 mentre la porta si apre alle 0:52.",
            "Mezzi, movente e occasione servono a scegliere su chi concentrarsi, non a provare la colpa: avere un motivo non vuol dire aver agito.",
            "«How often have I said to you that when you have eliminated the impossible whatever remains, however improbable, must be the truth?» «Quante volte ti ho detto che, eliminato l'impossibile, ciò che resta, per quanto improbabile, deve essere la verità?» (Holmes, «Il segno dei quattro», 1890.) Funziona a una condizione: aver messo sul tavolo tutte le possibilità. Se ne hai dimenticata una, il metodo ti porta con sicurezza alla risposta sbagliata."
          ],
          example: { q: "Nel caso del bar, perché la busta nel bidone della cucina è un fatto così importante?", a: "Da sola non dice chi. Ma insieme a un altro fatto, il bidone svuotato alle 23:46, dice quando: qualcuno è tornato dopo la chiusura. Due fatti messi insieme valgono molto più della loro somma." }
        }
      ],
      sources: [
        ["Conan Doyle, The Sign of the Four (1890), cap. VI, Project Gutenberg", "https://gutenberg.org/files/2097/2097-h/2097-h.htm"],
        ["Conan Doyle, A Scandal in Bohemia (1891), Project Gutenberg", "https://gutenberg.org/files/1661/1661-h/1661-h.htm"],
        ["Ragionamento abduttivo (voce di Wikipedia, con bibliografia su Holmes e Peirce)", "https://en.wikipedia.org/wiki/Abductive_reasoning"]
      ],
      checks: [
        { q: "Holmes vede un'abbronzatura e un braccio rigido e dice: «È stato in Afghanistan». Che tipo di ragionamento è?", options: ["Deduzione: la conclusione segue per forza", "Abduzione: la spiegazione migliore, che però può essere sbagliata", "Induzione: una regola ricavata da tanti casi", "Intuizione: non è un ragionamento"], answer: 1, why: "Gli indizi rendono la spiegazione probabile, non certa: è abduzione." },
        { q: "A che cosa servono mezzi, movente e occasione?", options: ["A provare la colpa davanti a un giudice", "A scegliere su chi concentrare le indagini", "A scartare chi ha un alibi", "A capire chi mente"], answer: 1, why: "Sono indicatori di sospetto, non prove: molti hanno un movente, pochi agiscono." }
      ]
    },
    {
      id: "tunnel", title: "La visione a tunnel", minutes: 6, train: "liar",
      lead: "Il nemico più pericoloso di un investigatore non è il colpevole furbo: è l'idea che si è fatto troppo presto.",
      sections: [
        {
          title: "Che cos'è",
          body: [
            "Findley e Scott (2006) la descrivono come una tendenza umana naturale, con effetti particolarmente dannosi nella giustizia penale: ci si concentra su un sospettato e da lì in poi si raccolgono e si leggono i fatti per confermare quell'idea, mentre quello che la contraddice viene ignorato o sminuito.",
            "Ha tre radici: distorsioni del pensiero (come il bias di conferma, cercare solo le prove che ci danno ragione), pressioni del ruolo e dell'organizzazione (risolvere in fretta, non smentire un collega), e un sistema che finisce per considerarla normale."
          ]
        },
        {
          title: "Gli antidoti",
          body: [
            "Scrivi almeno due ipotesi prima di sceglierne una, e per ognuna chiediti: quale fatto la smentirebbe? Poi vai a cercare proprio quel fatto.",
            "Tieni il taccuino diviso in due: fatti da una parte, interpretazioni dall'altra. «Kevin è nervoso» è un fatto; «Kevin nasconde qualcosa» è un'interpretazione, e qui era sbagliata.",
            "Ricorda che chi mente non è per forza il colpevole. Le persone mentono per vergogna, per proteggere qualcuno, per una sigaretta fumata di nascosto. Una bugia è un motivo per chiedere, non una prova.",
            "Diffida del sospettato «perfetto»: la badante che tutti guardano, la copista che dipinge proprio quel quadro. Il pregiudizio è un indizio falso che si presenta come vero."
          ],
          example: { q: "Nel caso dell'orologio, perché Matteo era una trappola per l'investigatore?", a: "Aveva mentito, e la bugia attira. Ma mentiva su una sigaretta, e per di più dopo le 20:55, quando l'orologio era già sparito. Chi si ferma alla bugia smette di guardare i fatti." }
        }
      ],
      sources: [
        ["Findley e Scott (2006), The Multiple Dimensions of Tunnel Vision in Criminal Cases, Wisconsin Law Review", "https://papers.ssrn.com/abstract=911240"]
      ],
      checks: [
        { q: "Un sospettato ha mentito su dove si trovava. Che cosa ne segue?", options: ["È il colpevole", "È un motivo per approfondire: si mente anche per ragioni che non c'entrano", "Va escluso: i colpevoli preparano bugie migliori", "Niente: le bugie non contano"], answer: 1, why: "La bugia è un indizio da verificare, non una prova: si mente per vergogna, per paura, per proteggere qualcuno." },
        { q: "Qual è l'antidoto più efficace alla visione a tunnel?", options: ["Fidarsi dell'esperienza", "Cercare il fatto che smentirebbe la propria ipotesi", "Decidere in fretta per non perdere tempo", "Interrogare più a lungo il sospettato principale"], answer: 1, why: "Cercare attivamente la smentita è l'unico modo di compensare la tendenza a vedere solo le conferme." }
      ]
    },
    {
      id: "coldread", title: "Come lavora un finto sensitivo", minutes: 8, train: "read",
      lead: "Patrick Jane, nella serie, è un ex sensitivo che ammette di essere stato un truffatore. I trucchi che usava sono studiati da decenni: conoscerli serve a non farsi ingannare, da un mago come da un venditore.",
      sections: [
        {
          title: "La serie e il suo protagonista",
          body: [
            "«The Mentalist» è andata in onda sulla CBS dal 2008 al 2015: sette stagioni, 151 episodi, creata da Bruno Heller, con Simon Baker nel ruolo di Patrick Jane. Il personaggio è un ex medium televisivo, di successo e dichiaratamente fasullo, che diventa consulente di un'agenzia investigativa e usa l'osservazione e la lettura a freddo per risolvere i casi.",
            "La serie stessa, quindi, dice la cosa più importante: non c'è nessun potere. C'è osservazione, psicologia, e tecnica."
          ]
        },
        {
          title: "La lettura a freddo",
          body: [
            "Lo psicologo Ray Hyman, che da ragazzo leggeva la mano e ci credeva, la descrisse nel 1977 in un articolo famoso. Un giorno un mentore gli suggerì di fare letture opposte a quello che dicevano le linee: i clienti erano soddisfatti lo stesso. Tra le sue regole: essere sicuri di sé, conoscere le statistiche, avere un repertorio di frasi pronte, tenere gli occhi aperti su vestiti, gioielli e reazioni, «pescare» informazioni, ascoltare, e dire al cliente quello che vuole sentirsi dire.",
            "Bertram Forer, nel 1949, diede a 39 studenti un «profilo di personalità personale», in realtà identico per tutti e preso in gran parte da un libro di astrologia. Il voto medio di accuratezza fu di circa 4,3 su 5. È l'effetto Barnum: le frasi generiche ci sembrano scritte per noi, soprattutto se sono lusinghiere e se ci dicono che sono «per te».",
            "Ian Rowland, che ha catalogato decine di tecniche, ne descrive alcune che si ritrovano ovunque: l'affermazione Barnum (vale per tutti), l'arcobaleno (un tratto e il suo contrario), la frase sull'età (Jacques Statement: la crisi dei quarant'anni, la casa del passato a settanta), il fatto sfocato (il sensitivo dice qualcosa di vago, il cliente gli dà il significato), il colpo probabile e la lettura a caldo (informazioni raccolte prima, di nascosto). A queste si aggiungono la pesca, cioè domande travestite da affermazioni, e lo sparo a ventaglio davanti a un pubblico."
          ]
        },
        {
          title: "Come difendersi",
          body: [
            "Conta gli errori, non solo i colpi: un sensitivo ne sbaglia tantissimi, ma il cervello ricorda quelli giusti.",
            "Chiedi affermazioni precise e verificabili, dette prima: un nome intero, una data, un fatto che puoi controllare. Le frasi vaghe non contano.",
            "Non dare informazioni: rispondi «non so, vada avanti» alle domande travestite. La lettura si sgonfia da sola."
          ],
          example: { q: "«Sento una figura maschile anziana, un nonno o uno zio... ti dice qualcosa?» Quante tecniche ci sono in questa frase?", a: "Almeno due: il colpo probabile (quasi tutti hanno un nonno o uno zio anziano, vivo o morto) e la pesca (il «ti dice qualcosa?» chiede al cliente di completare)." }
        }
      ],
      sources: [
        ["Hyman (1977), «Cold reading»: how to convince strangers that you know all about them", "https://skepdic.com/Hyman_cold_reading.htm"],
        ["Dickson e Kelly (1985), The Barnum effect in personality assessment, Psychological Reports", "https://cortecs.org/wp-content/uploads/2014/12/the-barnum-effect-in-personality-assessment-a-review-of-the-literature.pdf"],
        ["Ian Rowland, le tecniche della lettura a freddo", "https://www.ianrowland.com/cold-reading-techniques"],
        ["The Mentalist (voce di Wikipedia)", "https://en.wikipedia.org/wiki/The_Mentalist"],
        ["Effetto Barnum ed esperimento di Forer (voce di Wikipedia)", "https://en.wikipedia.org/wiki/Barnum_effect"]
      ],
      checks: [
        { q: "«Sai essere molto aperto con gli altri, ma a volte ti chiudi e vuoi stare da solo.» Che tecnica è?", options: ["Lettura a caldo", "Arcobaleno", "Pesca", "Frase sull'età"], answer: 1, why: "Un tratto e il suo contrario: qualunque carattere tu abbia, la frase ci prende." },
        { q: "Che cosa dimostrò Forer nel 1949?", options: ["Che i sensitivi indovinano più del caso", "Che un profilo generico, uguale per tutti, sembra preciso e personale", "Che le persone diffidano dei profili lusinghieri", "Che gli studenti non credono all'astrologia"], answer: 1, why: "Voto medio di circa 4,3 su 5 a un profilo identico per tutti: è l'effetto Barnum." }
      ]
    },
    {
      id: "lies", title: "Capire chi mente: cosa funziona davvero", minutes: 9, train: "interro",
      lead: "In televisione basta uno sguardo. Nella realtà siamo quasi tutti scarsi a scoprire le bugie, esperti compresi. Ma ci sono metodi che funzionano un po' meglio del caso, e non sono quelli che si pensa.",
      sections: [
        {
          title: "Quanto siamo bravi (poco)",
          body: [
            "Bond e DePaulo (2006) hanno messo insieme 206 studi e quasi 25.000 giudici: in media si distingue la bugia dalla verità il 54% delle volte, appena sopra il 50% del lancio di una moneta. Le verità vengono riconosciute più delle bugie (61% contro 47%). Gli esperti, poliziotti compresi, non fanno meglio dei profani.",
            "DePaulo e colleghi (2003) hanno analizzato 158 possibili segnali di menzogna: la maggior parte non ha alcun legame con la bugia, o ne ha uno debolissimo. Distogliere lo sguardo, agitarsi, toccarsi il viso: lo fanno anche le persone sincere sotto pressione."
          ]
        },
        {
          title: "I miti da buttare",
          body: [
            "Gli occhi in alto a destra: falso. Wiseman e colleghi (2012) lo hanno verificato in tre studi, anche su appelli pubblici reali: nessun legame tra direzione dello sguardo e bugia.",
            "Le microespressioni: rarissime e poco utili. Porter e ten Brinke (2008) le hanno trovate solo nel 2% delle espressioni analizzate, sia in chi mentiva sia in chi no; un corso famoso per riconoscerle non ha funzionato meglio di un corso finto (Jordan e colleghi, 2019).",
            "«Il 93% della comunicazione è non verbale»: è una lettura sbagliata di esperimenti degli anni Sessanta su singole parole che esprimevano sentimenti. Lo stesso autore, Mehrabian, ha detto che quei numeri non valgono per la comunicazione in generale.",
            "«Prima chiacchiera, così vedi come si comporta quando è sincero»: una conversazione informale come termine di confronto non funziona e può ingannare (Palena e colleghi, 2018)."
          ]
        },
        {
          title: "Quello che funziona un po' meglio",
          body: [
            "Guardare il contenuto, non il corpo. Chi mente tende a dare meno dettagli verificabili (nomi, luoghi, testimoni, scontrini, telecamere) perché sa che potrebbero essere controllati. Nel primo studio sull'approccio della verificabilità (Nahari, Vrij e Fisher, 2014) contare i dettagli verificabili classificava correttamente il 79% dei racconti; una meta-analisi del 2021 conferma un effetto di grandezza media, e gli autori chiedono altre ricerche sul campo.",
            "Usare le prove con strategia (la tecnica SUE, prossima lezione): nello studio di Hartwig e colleghi (2006) gli intervistatori addestrati hanno riconosciuto chi mentiva l'85,4% delle volte, contro il 56,1% di quelli non addestrati.",
            "Il racconto all'indietro (raccontare dalla fine all'inizio, più faticoso per chi inventa) ha dato buoni risultati in uno studio del 2008 (60% di bugie scoperte contro 42%), ma una replica del 2015 non li ha confermati: è un metodo da prendere con cautela."
          ],
          example: { q: "Due persone raccontano la stessa serata. Una dice «Ero al cinema, poi a casa». L'altra «Ero al cinema Odeon, spettacolo delle 21, con mia cugina Sara; ho pagato con la carta». Quale racconto è più facile da verificare?", a: "Il secondo: cinema, orario, testimone, pagamento. Non prova che sia vero, ma chi mente tende a evitare proprio questi dettagli." }
        }
      ],
      sources: [
        ["Bond e DePaulo (2006), Accuracy of deception judgments, Personality and Social Psychology Review", "https://assets.aclu.org/live/uploads/document/foia/2006-Personality-and-Social-Psychology-Review-Accuracy-of-Deception-Judgements.pdf"],
        ["DePaulo e colleghi (2003), Cues to deception, Psychological Bulletin", "https://smg.media.mit.edu/library/DePauloEtAl.Cues%20to%20Deception.pdf"],
        ["Wiseman e colleghi (2012), The eyes don't have it, PLoS ONE", "https://uhra.herts.ac.uk/id/eprint/3518/1/904716.pdf"],
        ["Porter e ten Brinke (2008), Psychological Science: le microespressioni", "https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2008.02116.x/"],
        ["Jordan e colleghi (2019): il corso sulle microespressioni non migliora", "https://pure.hud.ac.uk/en/publications/a-test-of-the-micro-expressions-training-tool-does-it-improve-lie/"],
        ["Nahari, Vrij e Fisher (2014), l'approccio della verificabilità", "https://researchportal.port.ac.uk/en/publications/exploiting-liars-verbal-strategies-by-examining-the-verifiability/"],
        ["Palena e colleghi (2021), meta-analisi dell'approccio della verificabilità", "https://researchportal.port.ac.uk/en/publications/the-verifiability-approach-a-meta-analysis/"],
        ["Palena e colleghi (2018): la chiacchierata come termine di confronto non funziona", "https://researchportal.port.ac.uk/en/publications/detecting-deception-through-small-talk-and-comparable-truth-basel/"],
        ["Vrij e colleghi (2008), il racconto all'indietro", "https://www.gwern.net/doc/psychology/2008-vrij.pdf"],
        ["Fenn e colleghi (2015), la replica non riuscita", "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.01298/full"]
      ],
      checks: [
        { q: "In media, quanto spesso le persone distinguono una bugia da una verità?", options: ["Circa il 90%", "Circa il 75%", "Circa il 54%", "Meno del 30%"], answer: 2, why: "54% in oltre 200 studi: appena sopra il caso. E gli esperti non fanno meglio." },
        { q: "Quale di questi indizi è il più utile per capire se un racconto è inventato?", options: ["Guarda in alto a destra", "Si tocca il naso", "Dà pochi dettagli verificabili (nomi, luoghi, testimoni)", "Evita lo sguardo"], answer: 2, why: "Il contenuto verificabile è tra i pochi indizi con un effetto misurato; i segnali del corpo sono deboli o nulli." }
      ]
    },
    {
      id: "interview", title: "Interrogare bene: le prove al momento giusto", minutes: 9, train: "interro",
      lead: "Jane spesso provoca e bluffa. Gli investigatori veri hanno scoperto che funziona meglio l'opposto: lasciar parlare, chiedere, e mostrare quello che si sa solo alla fine.",
      sections: [
        {
          title: "La tecnica SUE",
          body: [
            "La Strategic Use of Evidence (uso strategico delle prove) parte da un'osservazione: chi è innocente racconta tutto, anche i fatti che sembrano compromettenti, perché non ha niente da nascondere. Chi è colpevole evita: tace i fatti scomodi e, se gli chiedi direttamente, spesso li nega.",
            "Quindi: prima il racconto libero, senza suggerire niente. Poi domande sui fatti che conosci, senza dire come li conosci. Solo alla fine mostri le prove. Se il sospettato ha negato qualcosa che le prove dimostrano, la contraddizione è lì, davanti a tutti. Se invece mostri subito le prove, chi mente adatta la storia e la contraddizione sparisce.",
            "Nello studio di Hartwig e colleghi (2006) gli allievi poliziotti addestrati così hanno riconosciuto chi mentiva l'85,4% delle volte, contro il 56,1% di chi interrogava senza strategia: i sospettati che mentivano, con loro, contraddicevano le prove molto più spesso."
          ]
        },
        {
          title: "PEACE contro il metodo dell'accusa",
          body: [
            "Nel Regno Unito, dopo alcuni gravi errori giudiziari causati da confessioni false, dagli anni Novanta si usa il modello PEACE: preparazione, presentazione e spiegazione, racconto con chiarimenti e contestazioni, chiusura, valutazione. Lo scopo è raccogliere informazioni, non ottenere una confessione.",
            "Il metodo Reid, diffuso negli Stati Uniti, è invece accusatorio: si parte dalla convinzione che il sospettato sia colpevole e si cerca la confessione. I critici lo collegano a un alto numero di confessioni false. Secondo l'Innocence Project, nel 29% dei primi 375 casi di condannati poi scagionati dal DNA negli Stati Uniti c'era una confessione falsa."
          ]
        },
        {
          title: "Che cosa dice la legge italiana",
          body: [
            "Art. 64, comma 2, del codice di procedura penale: «Non possono essere utilizzati, neppure con il consenso della persona interrogata, metodi o tecniche idonei a influire sulla libertà di autodeterminazione o ad alterare la capacità di ricordare e di valutare i fatti.»",
            "L'art. 188 estende la stessa tutela, la libertà morale, a tutte le prove, testimoni compresi. Le pressioni e i trucchi di Jane, in un interrogatorio vero, renderebbero inutilizzabile quello che si ottiene. La tecnica delle prove al momento giusto, invece, non inganna nessuno: lascia solo che la verità e la bugia si comportino in modo diverso."
          ],
          example: { q: "Hai un video che mostra il sospettato in stazione alle 21. Qual è la mossa migliore?", a: "Prima chiedergli di raccontare la serata, poi chiedere «sei passato dalla stazione?» senza nominare il video. Se nega, alla fine mostri il video: ha negato un fatto provato. Se lo mostri subito, ti risponderà «ah sì, ero lì per le sigarette», e non saprai mai se è vero." }
        }
      ],
      sources: [
        ["Hartwig, Granhag, Strömwall e Kronkvist (2006), Law and Human Behavior", "https://link.springer.com/doi/10.1007/s10979-006-9053-9"],
        ["Il modello PEACE (CREST, Nunan e Milne 2018)", "https://www.crestresearch.ac.uk/comment/turning-research-into-practice-in-investigative-interviewing/"],
        ["Innocence Project: le condanne annullate grazie al DNA", "https://innocenceproject.org/dna-exonerations-in-the-united-states/"],
        ["Kassin e colleghi (2010), Police-induced confessions (American Psychological Association)", "https://www.apa.org/pubs/highlights/spotlight/police-induced-confessions"],
        ["Codice di procedura penale, art. 64 (Brocardi)", "https://brocardi.it/codice-di-procedura-penale/libro-primo/titolo-iv/art64.html"],
        ["Codice di procedura penale, art. 188 (Brocardi)", "https://brocardi.it/codice-di-procedura-penale/libro-terzo/titolo-i/art188.html"]
      ],
      checks: [
        { q: "Secondo la tecnica SUE, quando vanno mostrate le prove?", options: ["Subito, per mettere pressione", "Alla fine, dopo il racconto libero e le domande", "Mai", "Solo se il sospettato è nervoso"], answer: 1, why: "Mostrate alla fine permettono di vedere se il racconto le contraddiceva. Mostrate all'inizio, permettono a chi mente di adattarsi." },
        { q: "Che cosa vieta l'art. 64 del codice di procedura penale?", options: ["Di fare domande sugli orari", "Le tecniche che influiscono sulla libertà di decidere o sulla memoria, anche con il consenso dell'interrogato", "Di mostrare le prove", "Di interrogare senza avvocato in ogni caso"], answer: 1, why: "Nemmeno il consenso le rende lecite: è la tutela della libertà morale." }
      ]
    },
    {
      id: "trap", title: "La trappola: far agire il colpevole", minutes: 7,
      lead: "Le trappole di Jane sembrano trovate da sceneggiatura. Ma il principio è serio, e la psicologia lo misura da più di sessant'anni: il colpevole sa cose che gli innocenti non sanno.",
      sections: [
        {
          title: "L'informazione nascosta",
          body: [
            "Nel 1959 David Lykken propose il «test della conoscenza colpevole», oggi chiamato test dell'informazione nascosta: invece di chiedere «sei stato tu?», si mostrano alla persona dettagli del reato mescolati a dettagli falsi (l'arma era un coltello? una corda? un bastone?) e si misurano le reazioni del corpo. Solo chi c'era riconosce quello vero.",
            "Una meta-analisi di Ben-Shakhar ed Elaad (2003) su 80 studi di laboratorio ha trovato un effetto molto forte, soprattutto negli esperimenti con reati simulati. È una cosa diversa dalla «macchina della verità»: non misura l'agitazione davanti a un'accusa, misura il riconoscimento."
          ]
        },
        {
          title: "La versione di Jane",
          body: [
            "Le trappole dei casi usano lo stesso principio, senza strumenti: creano una situazione in cui solo chi sa reagisce. Le banconote «registrate» spaventano solo chi le ha in tasca. L'orologio «ritrovato in giardino» insospettisce solo chi sa che è altrove. Le scarpe da consegnare preoccupano solo chi sa che cosa c'è sopra.",
            "La trappola del canarino è un'altra variante: si danno versioni leggermente diverse dello stesso documento a persone diverse e si guarda quale versione esce. Il nome lo ha reso famoso Tom Clancy nel romanzo «Patriot Games» (1987), ma il metodo è più antico: i servizi segreti britannici lo chiamavano «pasto al bario»."
          ]
        },
        {
          title: "Il limite",
          body: [
            "Una trappola buona non spinge nessuno a confessare: fa agire il colpevole sulla sua conoscenza, e lascia tranquilli gli innocenti. Una trappola cattiva mette pressione su tutti e produce reazioni anche in chi non c'entra. E nei procedimenti veri gli inganni hanno limiti precisi: quello che si ottiene violando la libertà di autodeterminazione non vale come prova."
          ],
          example: { q: "Perché «dire che le banconote sono registrate» funziona meglio di «minacciare tutti di licenziamento»?", a: "La prima frase cambia il comportamento solo di chi ha i soldi. La seconda agita tutti: il nervosismo che produce non distingue niente." }
        }
      ],
      sources: [
        ["Ben-Shakhar ed Elaad (2003), Journal of Applied Psychology 88(1): meta-analisi del test della conoscenza colpevole", "https://cris.huji.ac.il/en/publications/the-validity-of-psychophysiological-detection-of-information-with/"],
        ["Lykken (1959), The GSR in the detection of guilt, Journal of Applied Psychology", "https://deepdyve.com/lp/doc/f00JVks0xw"],
        ["La trappola del canarino (voce di Wikipedia)", "https://en.wikipedia.org/wiki/Canary_trap"]
      ],
      checks: [
        { q: "Su che cosa si basa il test dell'informazione nascosta?", options: ["Sul nervosismo davanti all'accusa", "Sul fatto che solo il colpevole riconosce i dettagli veri del reato", "Sulla direzione dello sguardo", "Sulla velocità delle risposte"], answer: 1, why: "Misura il riconoscimento di dettagli che solo chi c'era conosce, non l'agitazione." },
        { q: "Che cosa rende buona una trappola?", options: ["Spaventa tutti allo stesso modo", "Cambia il comportamento solo di chi ha un'informazione che hanno solo i colpevoli", "Porta alla confessione", "Usa la pressione psicologica"], answer: 1, why: "Gli innocenti restano tranquilli; il colpevole deve agire su quello che sa." }
      ]
    },
    {
      id: "misdirection", title: "Il depistaggio", minutes: 6, train: "kim",
      lead: "I prestigiatori sanno da secoli dove va l'attenzione e come spostarla. La scienza li studia da poco. Saperlo serve due volte: per notare quando qualcuno ti distrae, e per guardare dove gli altri non guardano.",
      sections: [
        {
          title: "Che cosa dicono gli studi",
          body: [
            "Kuhn, Amlani e Rensink (2008) definiscono il depistaggio come lo spostamento dell'attenzione lontano dal metodo del trucco, e dividono la magia in tre campi: controllare l'attenzione, distorcere la percezione, influenzare le scelte.",
            "In un esperimento di Kuhn e Tatler (2005) un mago faceva sparire una sigaretta lasciandola cadere sotto gli occhi di tutti: dei 20 spettatori, solo 2 l'hanno vista cadere la prima volta. Rivedendo il trucco, tutti. E vederla non dipendeva da dove puntavano gli occhi: si può guardare un punto e non vederlo.",
            "Macknik e colleghi (2008) distinguono il depistaggio che sposta lo sguardo da quello che sposta l'attenzione senza muovere gli occhi. Nello stesso lavoro ricordano gli esperimenti sulla «cecità alla scelta»: quando a una persona veniva mostrata una foto diversa da quella che aveva scelto, solo il 26% degli scambi veniva scoperto."
          ]
        },
        {
          title: "Usarlo per vedere",
          body: [
            "Quando qualcuno ti mette fretta, ti emoziona, ti fa guardare un dettaglio rumoroso, chiediti dove non stai guardando. Il truffatore al telefono crea urgenza proprio per questo.",
            "Nelle indagini, il dettaglio più evidente è spesso quello messo lì per te: il fango sul davanzale, la finestra aperta, la scala bagnata. Chiediti chi aveva interesse a farti guardare proprio lì."
          ],
          example: { q: "Nel caso dell'orologio, qual era il depistaggio?", a: "La finestra aperta con il fango: un invito a guardare fuori, verso un ladro immaginario, invece che dentro la casa, tra chi era seduto a tavola." }
        }
      ],
      sources: [
        ["Kuhn, Amlani e Rensink (2008), Towards a science of magic, Trends in Cognitive Sciences", "https://www2.psych.ubc.ca/~rensink/publications/download/ScienceOfMagic-KAR.pdf"],
        ["Macknik e colleghi (2008), Attention and awareness in stage magic, Nature Reviews Neuroscience", "https://www.gwern.net/docs/psychology/illusion-of-depth/2008-macknik.pdf"],
        ["Kuhn e Tatler (2005), Magic and fixation, Perception (scheda)", "https://researchportal.plymouth.ac.uk/en/publications/magic-and-fixation-now-you-dont-see-it-now-you-do/"],
        ["Barnhart e Goldinger (2014), Frontiers in Psychology: i dati della sigaretta", "https://frontiersin.org/articles/10.3389/fpsyg.2014.01461/full"]
      ],
      checks: [
        { q: "Nell'esperimento della sigaretta, quanti spettatori su 20 l'hanno vista cadere la prima volta?", options: ["Quasi tutti", "Circa metà", "Due", "Nessuno"], answer: 2, why: "Solo 2 su 20. Al secondo tentativo, sapendo dove guardare, tutti." },
        { q: "Davanti a una scena del crimine «troppo evidente», qual è la domanda giusta?", options: ["Chi è il colpevole più probabile?", "Chi aveva interesse a farmi guardare proprio qui?", "Quanto tempo ho?", "Che cosa direbbe Jane?"], answer: 1, why: "Il dettaglio rumoroso può essere un depistaggio messo apposta." }
      ]
    },
    {
      id: "palace", title: "La memoria del mentalista", minutes: 5,
      lead: "Jane ricorda tutto: nomi, dettagli, frasi dette giorni prima. Nella serie usa un «palazzo della memoria». È una tecnica vera, la stessa dei campioni di memoria.",
      sections: [
        {
          title: "Che cosa sappiamo",
          body: [
            "Maguire e colleghi (2003) hanno studiato dieci persone con una memoria eccezionale, otto delle quali venivano dai campionati mondiali di memoria. Non avevano un quoziente intellettivo più alto degli altri, né un cervello diverso. Nove su dieci usavano lo stesso metodo: il metodo dei luoghi, cioè sistemare le cose da ricordare lungo un percorso che si conosce bene.",
            "Per un investigatore serve a tenere a mente i fatti di un caso nell'ordine giusto: ogni stanza un fatto, ogni oggetto un dettaglio. Nel reparto Memoria trovi il palazzo della memoria con gli esercizi."
          ],
          example: { q: "Perché il metodo dei luoghi funziona?", a: "Perché sfrutta la memoria dei luoghi, che è molto forte: i fatti astratti, attaccati a posti concreti lungo un percorso, si ritrovano nell'ordine giusto." }
        }
      ],
      sources: [
        ["Maguire e colleghi (2003), Routes to remembering, Nature Neuroscience", "https://sites.uni.edu/gabriele/page4/files/maguire002820020029brains-behind-superior-memorizers.pdf"],
        ["«The dead in the memory palace»: il palazzo della memoria in The Mentalist (University of Bucharest Review)", "https://journals.unibuc.ro/index.php/ubr/en/article/view/2699"]
      ],
      checks: [
        { q: "Che cosa avevano in comune i campioni di memoria studiati nel 2003?", options: ["Un quoziente intellettivo molto alto", "Un cervello diverso dal normale", "Quasi tutti usavano il metodo dei luoghi", "Avevano tutti meno di vent'anni"], answer: 2, why: "Nove su dieci usavano il metodo dei luoghi; intelligenza e struttura del cervello erano nella norma." },
        { q: "Come si usa il palazzo della memoria per un caso?", options: ["Si ripetono i fatti ad alta voce", "Si mette ogni fatto in un luogo preciso di un percorso conosciuto", "Si scrivono i fatti in ordine alfabetico", "Si immagina il colpevole"], answer: 1, why: "Ogni fatto in un luogo, lungo un percorso che conosci: poi lo ripercorri e li ritrovi in ordine." }
      ]
    }
  ];

  const api = { LESSONS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistData = api;
})(typeof window !== "undefined" ? window : globalThis);
