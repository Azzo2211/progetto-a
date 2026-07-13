(function () {
  const mentors = [
    {
      min: 1,
      max: 3,
      name: "Kikyo Kushida",
      role: "Supporto per principianti",
      rank: "Classe D",
      imageDataPath: "assets/cote/kushida.data.txt",
      fallback: "K",
      intro: "Partiamo dalle basi. Prima di muovere, controlla sempre scacchi, catture e pezzi indifesi."
    },
    {
      min: 4,
      max: 6,
      name: "Suzune Horikita",
      role: "Disciplina e fondamentali",
      rank: "Classe D+",
      imageDataPath: "assets/cote/horikita.data.txt",
      fallback: "H",
      intro: "Non perdere tempo con mosse decorative. Sviluppa, proteggi il re e limita gli errori semplici."
    },
    {
      min: 7,
      max: 9,
      name: "Kakeru Ryuen",
      role: "Pressione tattica",
      rank: "Classe C",
      imageDataPath: "assets/cote/ryuen.data.txt",
      fallback: "R",
      intro: "Se lasci una debolezza, verrà sfruttata. Cerca la risposta più aggressiva dell'avversario."
    },
    {
      min: 10,
      max: 12,
      name: "Arisu Sakayanagi",
      role: "Calcolo e strategia",
      rank: "Classe A",
      imageDataPath: "assets/cote/sakayanagi.data.txt",
      fallback: "S",
      intro: "Una buona mossa non basta. Devi capire quale struttura e quale finale stai costruendo."
    },
    {
      min: 13,
      max: 15,
      name: "Kiyotaka Ayanokoji",
      role: "Analisi d'élite",
      rank: "White Room",
      imageDataPath: "assets/cote/ayanokoji.data.txt",
      fallback: "A",
      intro: "Non cercare la mossa più appariscente. Cerca quella che lascia all'avversario meno possibilità."
    }
  ];

  const imageCache = new Map();

  function currentLevel() {
    return Number(state?.chess?.botLevel || currentGame?.botLevel || 1);
  }

  function mentorForLevel(value) {
    return mentors.find((item) => value >= item.min && value <= item.max) || mentors[0];
  }

  function addThemeStylesheet() {
    if (!document.getElementById("coteThemeStylesheet")) {
      const link = document.createElement("link");
      link.id = "coteThemeStylesheet";
      link.rel = "stylesheet";
      link.href = "cote-theme.css?v=20260713-3";
      document.head.appendChild(link);
    }

    if (!document.getElementById("coteChessBoardStyle")) {
      const style = document.createElement("style");
      style.id = "coteChessBoardStyle";
      style.textContent = `
        #chess.cote-theme .board-wrap {
          position: relative;
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(36,18,31,.98), rgba(7,15,28,.98));
          border: 1px solid rgba(230,199,119,.42);
          box-shadow: 0 24px 60px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.05);
        }
        #chess.cote-theme .board-wrap::before {
          content: "ADVANCED NURTURING HIGH SCHOOL";
          display: block;
          margin: 0 0 10px;
          text-align: center;
          color: rgba(230,199,119,.78);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .2em;
        }
        #chess.cote-theme .chess-board {
          overflow: hidden;
          border: 8px solid #211522;
          outline: 2px solid rgba(230,199,119,.72);
          border-radius: 10px;
          background: #151c2c;
          box-shadow: 0 26px 64px rgba(0,0,0,.5), 0 0 34px rgba(150,32,56,.25);
        }
        #chess.cote-theme .chess-square.light,
        #chess.cote-theme .square.light {
          background: linear-gradient(145deg, #d5c4a6, #a9947a) !important;
        }
        #chess.cote-theme .chess-square.dark,
        #chess.cote-theme .square.dark {
          background: linear-gradient(145deg, #4b2436, #241827) !important;
        }
        #chess.cote-theme .chess-square.selected,
        #chess.cote-theme .square.selected {
          box-shadow: inset 0 0 0 4px rgba(230,199,119,.95), inset 0 0 28px rgba(230,199,119,.35) !important;
        }
        #chess.cote-theme .chess-square.last-move,
        #chess.cote-theme .square.last-move,
        #chess.cote-theme .chess-square.last,
        #chess.cote-theme .square.last {
          box-shadow: inset 0 0 0 3px rgba(208,74,97,.9), inset 0 0 24px rgba(208,74,97,.35) !important;
        }
        #chess.cote-theme .chess-square.legal::after,
        #chess.cote-theme .square.legal::after,
        #chess.cote-theme .chess-square.possible::after,
        #chess.cote-theme .square.possible::after {
          background: rgba(230,199,119,.72) !important;
          box-shadow: 0 0 12px rgba(230,199,119,.7);
        }
        #chess.cote-theme .board-status {
          margin-bottom: 12px;
          padding: 10px 14px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function enableChessThemeOnly() {
    document.body.classList.remove("cote-theme");
    const chessSection = document.getElementById("chess");
    if (chessSection) chessSection.classList.add("cote-theme");
  }

  function coachMessageForMove(baseText, activeMentor) {
    const text = String(baseText || "").trim();
    return text || activeMentor.intro;
  }

  function ensureMentorCard() {
    const coachMessage = document.getElementById("coachMessage");
    if (!coachMessage) return null;
    let card = document.getElementById("coteMentorCard");
    if (card) return card;

    card = document.createElement("section");
    card.id = "coteMentorCard";
    card.className = "cote-mentor-card";
    card.innerHTML = `
      <div class="cote-mentor-image-wrap">
        <img class="cote-mentor-image" id="coteMentorImage" alt="Coach Classroom of the Elite">
        <span class="cote-mentor-rank" id="coteMentorRank"></span>
      </div>
      <div class="cote-mentor-copy">
        <span class="cote-mentor-kicker">Coach strategico</span>
        <h3 class="cote-mentor-name" id="coteMentorName"></h3>
        <p class="cote-mentor-role" id="coteMentorRole"></p>
        <p class="cote-mentor-speech" id="coteMentorSpeech"></p>
      </div>`;

    const coachCard = coachMessage.closest(".tool-card");
    if (coachCard) coachCard.insertAdjacentElement("afterend", card);
    else coachMessage.insertAdjacentElement("beforebegin", card);
    return card;
  }

  function resetImageFallback(image, activeMentor) {
    const wrap = image.parentElement;
    const oldFallback = wrap.querySelector(".cote-fallback-letter");
    if (oldFallback) oldFallback.remove();
    wrap.style.display = "block";
    wrap.style.placeItems = "initial";
    image.style.display = "block";
    image.alt = activeMentor.name;
  }

  function showImageFallback(image, activeMentor) {
    const wrap = image.parentElement;
    image.style.display = "none";
    if (!wrap.querySelector(".cote-fallback-letter")) {
      const letter = document.createElement("span");
      letter.className = "cote-fallback-letter";
      letter.textContent = activeMentor.fallback;
      wrap.appendChild(letter);
    }
  }

  async function getLocalImageData(path) {
    if (imageCache.has(path)) return imageCache.get(path);
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) throw new Error("Immagine locale non disponibile");
    const dataUrl = (await response.text()).trim();
    imageCache.set(path, dataUrl);
    return dataUrl;
  }

  function fitEloSelectInsideCard() {
    [document.getElementById("reportBotLevelSelect"), document.getElementById("botLevelSelect")]
      .filter(Boolean)
      .forEach((select) => {
        const parent = select.closest(".report-meta-item") || select.parentElement;
        if (parent) {
          parent.style.minWidth = "0";
          parent.style.overflow = "hidden";
        }
        select.style.width = "100%";
        select.style.maxWidth = "100%";
        select.style.minWidth = "0";
        select.style.boxSizing = "border-box";
      });
  }

  async function renderMentor() {
    addThemeStylesheet();
    enableChessThemeOnly();
    fitEloSelectInsideCard();

    const activeMentor = mentorForLevel(currentLevel());
    const card = ensureMentorCard();
    if (!card) return;

    document.getElementById("coteMentorName").textContent = activeMentor.name;
    const botProfile = getBotProfile(currentLevel());
    document.getElementById("coteMentorRole").textContent = activeMentor.role + " · Elo bot " + (botProfile.displayElo || botProfile.elo);
    document.getElementById("coteMentorRank").textContent = activeMentor.rank;

    const coach = document.getElementById("coachMessage");
    document.getElementById("coteMentorSpeech").textContent = coachMessageForMove(coach?.textContent, activeMentor);

    const image = document.getElementById("coteMentorImage");
    resetImageFallback(image, activeMentor);
    image.onload = () => resetImageFallback(image, activeMentor);
    image.onerror = () => showImageFallback(image, activeMentor);

    try {
      image.src = await getLocalImageData(activeMentor.imageDataPath);
    } catch (error) {
      showImageFallback(image, activeMentor);
    }
  }

  const originalRenderBotLevel = window.renderBotLevel;
  window.renderBotLevel = function () {
    const value = typeof originalRenderBotLevel === "function" ? originalRenderBotLevel.apply(this, arguments) : undefined;
    setTimeout(renderMentor, 0);
    return value;
  };

  const observer = new MutationObserver(function () {
    const coach = document.getElementById("coachMessage");
    const speech = document.getElementById("coteMentorSpeech");
    if (coach && speech) {
      const activeMentor = mentorForLevel(currentLevel());
      speech.textContent = coachMessageForMove(coach.textContent, activeMentor);
    }
    fitEloSelectInsideCard();
  });

  document.addEventListener("DOMContentLoaded", function () {
    addThemeStylesheet();
    enableChessThemeOnly();
    renderMentor();
    const coach = document.getElementById("coachMessage");
    if (coach) observer.observe(coach, { childList: true, subtree: true, characterData: true });
  });
})();