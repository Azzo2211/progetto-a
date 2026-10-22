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
    },
    {
      id: "alibi", title: "L'alibi e la linea del tempo", minutes: 8, train: "interro",
      lead: "Un alibi è un'affermazione sul tempo: «a quell'ora ero altrove». Va trattato come una prova da verificare, non come una risposta da credere o da smontare. E c'è una cosa che sorprende: anche gli innocenti sbagliano spesso il proprio alibi.",
      sections: [
        {
          title: "La linea del tempo",
          body: [
            "Il primo strumento è banale e potentissimo: mettere in fila i fatti che hanno un orario. Ogni fatto con un'ora diventa un paletto, e ogni racconto deve passare tra i paletti. Nel caso del bar, la busta trovata nel bidone svuotato alle 23:46 e la porta che si riapre alle 0:52 bastano a dire che qualcuno è tornato dopo la chiusura.",
            "Distingui gli orari forti da quelli deboli. Un registro elettronico, uno scontrino, un messaggio inviato sono forti; «verso le dieci» detto da un testimone è debole. E diffida degli orari che sembrano forti e non lo sono: l'ora in cui una foto è stata inviata non è l'ora in cui è stata scattata, e l'orologio di una telecamera può essere indietro.",
            "Poi cerca i buchi, i tratti di tempo in cui una persona non ha nessun paletto. Un buco non è una colpa, ma è il posto dove guardare."
          ],
          example: { q: "Nel caso della biblioteca, perché il diluvio delle 15:35 è un orario così utile?", a: "Perché non dipende da nessuno dei sospettati: è un orologio esterno. Chi è bagnato è uscito dopo le 15:35, e chi giura di non essere mai uscito non può avere le scarpe fradice." }
        },
        {
          title: "Che cosa rende credibile un alibi",
          body: [
            "Olson e Wells (2004) hanno proposto di classificare gli alibi secondo due tipi di conferma: le prove fisiche (uno scontrino, una telecamera, un biglietto) e le persone che li confermano. Nei loro esperimenti, 252 persone nel ruolo di investigatori davano molto peso alle prove fisiche, anche più di quanto gli autori si aspettassero.",
            "Hanno trovato anche due errori di chi giudica. Si fidava di un estraneo che confermava l'alibi senza pensare che anche un estraneo può sbagliarsi su chi ha visto. E si faceva influenzare da quanto la persona sembrava affidabile e simpatica, cosa che con la verità dell'alibi non c'entra.",
            "Per questo l'approccio della verificabilità (Nahari, Vrij e Fisher) guarda ai dettagli controllabili: un alibi con nomi, luoghi e scontrini si può verificare, uno fatto di «ero a casa da solo a guardare la televisione» no. Ma non verificabile non vuol dire falso: molte persone oneste, la sera, sono davvero a casa da sole."
          ]
        },
        {
          title: "Anche gli innocenti sbagliano",
          body: [
            "La sorpresa degli studi è che anche chi dice il vero sbaglia spesso il proprio alibi. Ricordare dove eri martedì scorso alle sei di sera è difficile: le giornate simili si confondono, e si finisce per raccontare il martedì tipico invece di quel martedì.",
            "In una ricerca finanziata dal National Institute of Justice degli Stati Uniti, solo il 16% degli innocenti interrogati senza aiuti dava un alibi esatto. Con un po' di tempo per prepararsi si saliva al 32%, e con la possibilità di controllare il telefono al 51%.",
            "La conseguenza è importante: un alibi sbagliato non è automaticamente una bugia. Prima di concludere, fai ricostruire la giornata con calma, con l'agenda o il telefono in mano. Chi si era confuso corregge, e la nuova versione torna con i fatti; chi mente tende a cambiare versione ogni volta che scopre che cosa sai."
          ],
          example: { q: "Un sospettato dice di essere stato in palestra martedì alle 19, ma il badge della palestra lo segna mercoledì. Che cosa concludi?", a: "Ancora niente. Può aver confuso i giorni, come capita spesso agli innocenti. Gli chiedi di ricostruire martedì con il telefono in mano: se trova un altro paletto verificabile, l'errore era di memoria; se la storia continua a cambiare per adattarsi a quello che sai, è un altro discorso." }
        }
      ],
      sources: [
        ["Olson e Wells (2004), What makes a good alibi? A proposed taxonomy, Law and Human Behavior", "https://link.springer.com/article/10.1023/B:LAHU.0000022320.47112.d3"],
        ["Olson e Charman (2012), «But can you prove it?»: la qualità degli alibi degli innocenti, Psychology, Crime & Law", "https://discovery.fiu.edu/display/pub117283"],
        ["National Institute of Justice: come aiutare gli innocenti a dare un alibi esatto", "https://nij.ojp.gov/library/publications/alibi-generation-and-discriminability-improving-innocent-suspects-accuracy-and"]
      ],
      checks: [
        { q: "Quale conferma rende più credibile un alibi, secondo gli esperimenti di Olson e Wells?", options: ["La testimonianza della madre del sospettato", "Una prova fisica, come uno scontrino o una telecamera", "Il fatto che il sospettato sembri una persona perbene", "La sicurezza con cui il sospettato racconta"], answer: 1, why: "Le prove fisiche pesavano più di tutto. La simpatia del sospettato non dovrebbe contare affatto, anche se chi giudica se ne fa influenzare." },
        { q: "Un sospettato sbaglia il giorno del suo alibi. Che cosa dicono gli studi?", options: ["Che sta sicuramente mentendo", "Che anche gli innocenti sbagliano spesso il proprio alibi: va fatto ricostruire con l'agenda o il telefono prima di concludere", "Che gli alibi non contano niente", "Che bisogna metterlo sotto pressione finché non dice la verità"], answer: 1, why: "Nello studio del National Institute of Justice, senza aiuti solo il 16% degli innocenti dava un alibi esatto. Un errore di memoria non è una bugia: la differenza si vede quando la persona ricostruisce con paletti verificabili." }
      ]
    },
    {
      id: "weight", title: "Quanto pesa una prova", minutes: 8, train: "liar",
      lead: "Un indizio non dice «colpevole» o «innocente»: rende una spiegazione più o meno probabile di un'altra. Confondere le due cose ha mandato in prigione persone innocenti.",
      sections: [
        {
          title: "La domanda giusta",
          body: [
            "Davanti a un indizio la domanda non è «è compatibile con la colpa?», ma «quanto è più probabile se è stato lui che se non è stato lui?». Il nervosismo è compatibile con la colpa, ma è quasi altrettanto probabile in un innocente interrogato: pesa pochissimo. Il fango fresco sugli stivali, in una notte in cui ha piovuto solo dopo mezzanotte, è molto più probabile in chi è uscito di notte: pesa tanto.",
            "Gli statistici chiamano questo confronto rapporto di verosimiglianza (likelihood ratio). Non servono conti: basta abituarsi a fare sempre anche la seconda metà della domanda, quella sull'innocente.",
            "Più indizi indipendenti nella stessa direzione si rafforzano a vicenda. Ma devono essere davvero indipendenti: tre testimoni che ripetono la stessa voce di corridoio valgono come un indizio solo."
          ]
        },
        {
          title: "L'errore del procuratore: il caso Sally Clark",
          body: [
            "Nel 1999, in Inghilterra, Sally Clark fu condannata per la morte dei suoi due bambini. Un esperto dell'accusa disse in aula che la probabilità di due morti in culla in una famiglia come la sua era di una su 73 milioni: aveva stimato circa una su 8.500 per un bambino e aveva moltiplicato il numero per sé stesso.",
            "Nel 2001 la Royal Statistical Society intervenne pubblicamente con due critiche. La prima: moltiplicare vale solo se i due eventi sono indipendenti, e in una stessa famiglia fattori genetici e ambientali comuni rendono questa ipotesi molto dubbia. La seconda, più profonda: anche un numero piccolissimo non è la probabilità che lei fosse innocente. Anche l'uccisione di due neonati da parte della madre è un evento rarissimo; conta quale delle due spiegazioni rare è più probabile. Scambiare «la probabilità dell'indizio se è innocente» con «la probabilità che sia innocente» si chiama errore del procuratore (prosecutor's fallacy).",
            "Sally Clark fu assolta in appello nel 2003, anche perché erano emersi esami medici che alla difesa non erano mai stati mostrati. Il suo caso si studia ancora nei corsi di statistica e di diritto."
          ]
        },
        {
          title: "Le prove che mancano",
          body: [
            "Anche l'assenza di qualcosa è un indizio, se ti aspetteresti di trovarlo. In «Silver Blaze» di Conan Doyle (1892) Holmes richiama l'attenzione dell'ispettore sullo strano episodio del cane durante la notte. Ma il cane non ha fatto niente, obietta l'ispettore. Ed è proprio questo lo strano episodio: il cane non ha abbaiato, quindi il visitatore notturno era qualcuno che conosceva.",
            "L'assenza pesa solo se, nell'altra ipotesi, la cosa ci sarebbe quasi di sicuro. Un cane che abbaia a tutti e stanotte tace dice molto; un cane che dorme sempre come un sasso non dice niente. È la stessa domanda di prima, applicata a quello che non c'è."
          ],
          example: { q: "In un furto in casa non si trovano impronte di nessuno. Che cosa ne ricavi?", a: "Poco, da sola: chi ruba usa spesso i guanti, e molte superfici non trattengono le impronte. L'assenza di impronte sarebbe un indizio forte solo se, nell'altra ipotesi, ti aspettassi quasi di sicuro di trovarle." }
        }
      ],
      sources: [
        ["La Royal Statistical Society sul caso Clark, in Chance News 11.01", "https://chance.dartmouth.edu/chance_news/recent_news/chance_news_11.01.html"],
        ["Sally Clark (voce di Wikipedia, con le sentenze e la bibliografia)", "https://en.wikipedia.org/wiki/Sally_Clark"],
        ["Conan Doyle, Silver Blaze, in The Memoirs of Sherlock Holmes, Project Gutenberg", "https://www.gutenberg.org/files/834/834-h/834-h.htm"]
      ],
      checks: [
        { q: "Un sospettato suda durante l'interrogatorio. Quanto pesa questo indizio?", options: ["Molto: chi mente suda", "Quasi niente: sudare sotto interrogatorio è probabile quasi quanto in un innocente", "Dipende solo da quanto suda", "È la prova che nasconde qualcosa"], answer: 1, why: "Un indizio pesa quanto è più probabile se la persona è colpevole che se è innocente. Sudare sotto interrogatorio è comune nei due casi: il confronto è quasi pari." },
        { q: "«La probabilità che due bambini muoiano così per cause naturali è una su 73 milioni, quindi la madre è colpevole.» Dov'è l'errore?", options: ["Nel numero, che è troppo alto", "Nello scambiare la probabilità dell'indizio se è innocente con la probabilità che sia innocente, e nel moltiplicare due eventi non indipendenti", "Non c'è errore: un numero così piccolo basta", "Nel fatto che le statistiche in tribunale non si possono usare"], answer: 1, why: "È l'errore del procuratore: anche la spiegazione alternativa era rarissima, e conta il confronto tra le due. E il numero stesso era sbagliato, perché supponeva indipendenti due morti nella stessa famiglia." }
      ]
    }
  ];

  const api = { LESSONS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistData = api;
})(typeof window !== "undefined" ? window : globalThis);
