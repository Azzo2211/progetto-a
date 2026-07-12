(function () {
  const mentors = [
    {
      min: 1,
      max: 3,
      name: "Kikyo Kushida",
      role: "Supporto per principianti",
      rank: "Classe D",
      image: "https://static.zerochan.net/Kushida.Kikyou.full.2107475.jpg",
      fallback: "K",
      intro: "Partiamo dalle basi. Prima di muovere, controlla sempre scacchi, catture e pezzi indifesi."
    },
    {
      min: 4,
      max: 6,
      name: "Suzune Horikita",
      role: "Disciplina e fondamentali",
      rank: "Classe D+",
      image: "https://static.zerochan.net/Horikita.Suzune.full.2107474.jpg",
      fallback: "H",
      intro: "Non perdere tempo con mosse decorative. Sviluppa, proteggi il re e limita gli errori semplici."
    },
    {
      min: 7,
      max: 9,
      name: "Kakeru Ryuen",
      role: "Pressione tattica",
      rank: "Classe C",
      image: "https://static.zerochan.net/Ryuuen.Kakeru.full.2257126.jpg",
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
      image: "https://static.zerochan.net/Ayanokouji.Kiyotaka.full.2257136.jpg",
      fallback: "A",
      intro: "Non cercare la mossa più appariscente. Cerca quella che lascia all'avversario meno possibilità."
    }
  ];

  function level() {
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
    link.href = "cote-theme.css?v=20260713-1";
    document.head.appendChild(link);
  }

  function coachMessageForMove(baseText, activeMentor) {
    const text = String(baseText || "").trim();
    if (!text) return activeMentor.intro;
    return text;
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

  function renderMentor() {
    addThemeStylesheet();
    document.body.classList.add("cote-theme");
    const activeMentor = mentorForLevel(level());
    const card = ensureMentorCard();
    if (!card) return;

    document.getElementById("coteMentorName").textContent = activeMentor.name;
    document.getElementById("coteMentorRole").textContent = activeMentor.role + " · Elo bot " + (getBotProfile(level()).displayElo || getBotProfile(level()).elo);
    document.getElementById("coteMentorRank").textContent = activeMentor.rank;
    const coach = document.getElementById("coachMessage");
    document.getElementById("coteMentorSpeech").textContent = coachMessageForMove(coach?.textContent, activeMentor);

    const image = document.getElementById("coteMentorImage");
    image.onerror = function () {
      image.removeAttribute("src");
      image.alt = activeMentor.name;
      image.style.display = "none";
      image.parentElement.style.display = "grid";
      image.parentElement.style.placeItems = "center";
      image.parentElement.style.fontSize = "46px";
      image.parentElement.style.fontWeight = "900";
      image.parentElement.style.color = "#e6c777";
      image.parentElement.dataset.fallback = activeMentor.fallback;
      if (!image.parentElement.querySelector(".cote-fallback-letter")) {
        const letter = document.createElement("span");
        letter.className = "cote-fallback-letter";
        letter.textContent = activeMentor.fallback;
        image.parentElement.appendChild(letter);
      }
    };
    image.style.display = "block";
    const oldFallback = image.parentElement.querySelector(".cote-fallback-letter");
    if (oldFallback) oldFallback.remove();
    image.src = activeMentor.image;
    image.alt = activeMentor.name;
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
      const activeMentor = mentorForLevel(level());
      speech.textContent = coachMessageForMove(coach.textContent, activeMentor);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    addThemeStylesheet();
    renderMentor();
    const coach = document.getElementById("coachMessage");
    if (coach) observer.observe(coach, { childList: true, subtree: true, characterData: true });
  });
})();
