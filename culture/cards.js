window.CultureCards = [
  {
    "id": "economia-interesse-composto",
    "area": "economia",
    "title": "L'interesse composto: il tempo che lavora per te (o contro di te)",
    "level": 1,
    "minutes": 4,
    "hook": "Perché 10.000 euro al 7% diventano circa 20.000 in dieci anni, e un debito di carta di credito fa lo stesso al contrario.",
    "sections": [
      {
        "h": "L'idea",
        "text": "Con l'interesse semplice guadagni sempre sulla stessa somma: 10.000 euro al 5% danno 500 euro l'anno, ogni anno. Con l'interesse composto gli interessi maturati si aggiungono al capitale e, dall'anno dopo, producono interessi anche loro. Il primo anno guadagni 500 euro, il secondo il 5% di 10.500, cioè 525, il terzo il 5% di 11.025, e così via. La differenza all'inizio è minima; col tempo diventa enorme, perché la crescita dipende da quanto hai già accumulato."
      },
      {
        "h": "La formula e la regola del 72",
        "text": "Il capitale finale è C × (1 + r)ⁿ, dove r è il tasso annuo e n il numero di anni. Per fare i conti a mente si usa la regola del 72: dividendo 72 per il tasso percentuale ottieni, in modo approssimato, gli anni necessari per raddoppiare. Al 6% servono circa 12 anni, al 9% circa 8, al 2% circa 36. La regola funziona bene per tassi tra il 2% e il 12% circa ed è utile per confrontare in fretta due alternative."
      },
      {
        "h": "Un esempio concreto",
        "text": "Due persone investono 200 euro al mese a un rendimento medio del 6% annuo. Anna comincia a 25 anni e smette a 35: versa 24.000 euro in tutto. Bruno comincia a 35 e continua fino a 65: versa 72.000 euro. A 65 anni Anna, che ha versato un terzo dei soldi, ha comunque una cifra paragonabile a quella di Bruno, perché i suoi primi versamenti hanno avuto trent'anni in più per comporsi. Il fattore decisivo non è stato quanto, ma quando."
      },
      {
        "h": "Il lato oscuro: debiti e costi",
        "text": "Lo stesso meccanismo lavora contro di te nei debiti. Un saldo di carta revolving al 18% annuo, se non lo riduci, raddoppia in circa 4 anni. Funziona così anche sui costi: una commissione dell'1,5% l'anno su un investimento sembra piccola, ma su trent'anni può portarsi via una parte rilevante del capitale finale, perché toglie ogni anno anche i rendimenti futuri di ciò che preleva. Per questo nei confronti tra prodotti finanziari i costi annui contano quasi quanto i rendimenti promessi."
      }
    ],
    "facts": [
      "Interesse composto: gli interessi producono altri interessi.",
      "Formula: C × (1 + r)ⁿ.",
      "Regola del 72: 72 ÷ tasso% ≈ anni per raddoppiare.",
      "Iniziare prima conta più di versare di più.",
      "Lo stesso meccanismo moltiplica debiti e costi annui."
    ],
    "links": [
      "matematica-crescita-esponenziale",
      "economia-inflazione-tassi",
      "trading-gestione-rischio"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Con la regola del 72, in quanti anni circa raddoppia un capitale investito all'8% annuo?",
        "options": [
          "Circa 9 anni",
          "Circa 12 anni",
          "Circa 6 anni",
          "Circa 15 anni"
        ],
        "answer": 0,
        "why": "72 diviso 8 fa 9: è una stima, ma molto vicina al valore esatto (circa 9 anni)."
      },
      {
        "type": "comprensione",
        "q": "Perché la differenza tra interesse semplice e composto è piccola all'inizio e grande dopo molti anni?",
        "options": [
          "Perché nel composto la crescita di ogni anno dipende da quanto si è già accumulato",
          "Perché le banche alzano il tasso dopo i primi anni",
          "Perché l'interesse semplice viene tassato di più",
          "Perché nel composto il tasso aumenta automaticamente ogni anno"
        ],
        "answer": 0,
        "why": "Il tasso resta uguale: cambia la base su cui si calcola, che cresce ogni anno con gli interessi già maturati."
      },
      {
        "type": "applicazione",
        "q": "Due fondi rendono entrambi il 6% lordo l'anno, ma uno costa lo 0,3% annuo e l'altro il 2%. Su 30 anni cosa succede?",
        "options": [
          "Il fondo più caro rende molto meno, perché il costo annuo si compone come un rendimento negativo",
          "Finiscono quasi uguali, perché la differenza di costo è piccola",
          "Il fondo più caro rende di più, perché costa di più",
          "Dipende solo da quale dei due ha più clienti"
        ],
        "answer": 0,
        "why": "Un costo annuo agisce come un interesse composto al contrario: l'1,7% di differenza ogni anno, su 30 anni, pesa moltissimo sul capitale finale."
      },
      {
        "type": "comprensione",
        "q": "Nell'esempio di Anna e Bruno, perché Anna arriva a una cifra simile pur avendo versato un terzo dei soldi?",
        "options": [
          "Perché i suoi versamenti hanno avuto molti più anni per comporsi",
          "Perché ha avuto un rendimento più alto di Bruno",
          "Perché ha pagato meno tasse",
          "Perché ha investito in un prodotto diverso"
        ],
        "answer": 0,
        "why": "Stesso rendimento per entrambi: a fare la differenza è il tempo, che nell'interesse composto conta più dell'importo versato."
      },
      {
        "type": "collegamento",
        "q": "Se l'inflazione è al 3% e il tuo conto rende l'1%, cosa succede al potere d'acquisto dei tuoi risparmi nel tempo?",
        "options": [
          "Diminuisce, e la perdita si compone anno dopo anno",
          "Aumenta, perché il conto rende qualcosa",
          "Resta uguale, perché inflazione e interessi si annullano",
          "Dipende solo dalla banca scelta"
        ],
        "answer": 0,
        "why": "Il rendimento reale è circa 1% − 3% = −2% l'anno: anche la perdita di potere d'acquisto segue la logica dell'interesse composto."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché conviene iniziare a risparmiare presto, anche con poco.",
      "model": "Con l'interesse composto i rendimenti si aggiungono al capitale e producono a loro volta rendimenti. Più anni lasci lavorare i soldi, più la crescita accelera, perché ogni anno parte da una base più alta. Per questo chi comincia presto con poco può arrivare dove arriva chi comincia tardi con molto. Lo stesso vale al contrario per debiti e costi annui.",
      "points": [
        "Gli interessi producono altri interessi",
        "Il tempo conta più dell'importo",
        "Vale anche al contrario per debiti e costi"
      ]
    }
  }
];
