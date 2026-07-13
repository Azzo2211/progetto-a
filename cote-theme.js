(function () {
  const mentors = [
    {
      min: 1,
      max: 3,
      name: "Kikyo Kushida",
      role: "Supporto per principianti",
      rank: "Classe D",
      image: "https://you-zitsu.com/1st/core_sys/images/main/cont/chara/kushida.png",
      fallback: "K",
      intro: "Partiamo dalle basi. Prima di muovere, controlla sempre scacchi, catture e pezzi indifesi."
    },
    {
      min: 4,
      max: 6,
      name: "Suzune Horikita",
      role: "Disciplina e fondamentali",
      rank: "Classe D+",
      image: "https://you-zitsu.com/1st/core_sys/images/main/cont/chara/horikita.png",
      fallback: "H",
      intro: "Non perdere tempo con mosse decorative. Sviluppa, proteggi il re e limita gli errori semplici."
    },
    {
      min: 7,
      max: 9,
      name: "Kakeru Ryuen",
      role: "Pressione tattica",
      rank: "Classe C",
      image: "https://you-zitsu.com/1st/core_sys/images/main/cont/chara/ryuen.png",
      fallback: "R",
      intro: "Se lasci una debolezza, verrà sfruttata. Cerca la risposta più aggressiva dell'avversario."
    },
    {
      min: 10,
      max: 12,
      name: "Arisu Sakayanagi",
      role: "Calcolo e strategia",
      rank: "Classe A",
      image: "https://you-zitsu.com/1st/core_sys/images/main/cont/chara/sakayanagi.png",
      fallback: "S",
      intro: "Una buona mossa non basta. Devi capire quale struttura e quale finale stai costruendo."
    },
    {
      min: 13,
      max: 15,
      name: "Kiyotaka Ayanokoji",
      role: "Analisi d'élite",
      rank: "White Room",
      image: "https://you-zitsu.com/1st/core_sys/images/main/cont/chara/ayanokoji.png",
      fallback: "A",
      intro: "Non cercare la mossa più appariscente. Cerca quella che lascia all'avversario meno possibilità."
    }
  ];

  function currentLevel() {
    return Number(state?.chess?.botLevel || currentGame?.botLevel || 1);
  }

  function mentorForLevel(value) {
    return mentors.find((item) => value >= item.min && value <= item.max) || mentors[0];
  }

  function addThemeStylesheet() {
    if (document.getElementById("coteThemeStylesheet")) return;
    const link = document.createElement("link");
    link.id = "coteThemeStylesheet";
    link.rel = "stylesheet";
    link.href = "cote-theme.css?v=20260713-2";
    document.head.appendChild(link);
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
        <img class="cote-mentor-image" id="coteMentorImage" alt="Coach Classroom of the Elite" referrerpolicy="no-referrer">
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

  function fitEloSelectInsideCard() {
    const reportSelect = document.getElementById("reportBotLevelSelect");
    if (reportSelect) {
      const parent = reportSelect.closest(".report-meta-item");
      if (parent) {
        parent.style.minWidth = "0";
        parent.style.overflow = "hidden";
      }
      reportSelect.style.width = "100%";
      reportSelect.style.maxWidth = "100%";
      reportSelect.style.minWidth = "0";
      reportSelect.style.boxSizing = "border-box";
    }

    const lowerSelect = document.getElementById("botLevelSelect");
    if (lowerSelect) {
      lowerSelect.style.width = "100%";
      lowerSelect.style.maxWidth = "100%";
      lowerSelect.style.minWidth = "0";
      lowerSelect.style.boxSizing = "border-box";
    }
  }

  function renderMentor() {
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
    image.onload = function () {
      resetImageFallback(image, activeMentor);
    };
    image.onerror = function () {
      showImageFallback(image, activeMentor);
    };
    image.src = activeMentor.image;
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
