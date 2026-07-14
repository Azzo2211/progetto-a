(function () {
  const criteria = {
    "Lettura dei fatti": {
      terms: ["osservo", "noto", "verifico", "fatto", "dato", "segnale", "contesto", "chiedo conferma"],
      missing: "non distingui chiaramente i fatti osservabili dalle tue ipotesi",
      improve: "scrivi cosa hai visto o sentito davvero, cosa non sai ancora e come lo verifichi"
    },
    "Chiarezza": {
      terms: ["prima", "poi", "dopo", "subito", "infine",