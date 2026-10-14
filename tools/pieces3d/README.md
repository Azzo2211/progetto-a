# Pezzi "Classroom" ed "Elite 3D" (generatore)

I set `assets/pieces/cote/` (Classroom, predefinito) e `assets/pieces/elite/`
(Elite 3D) sono gli stessi pezzi disegnati qui in 3D e poi fotografati in
immagini WebP (256x320, trasparenti):

- Classroom: stile anime (cel shading a bande, contorno a inchiostro, riflessi
  netti, luce di contorno azzurra), come nei disegni di Classroom of the Elite;
- Elite 3D: resa realistica, porcellana e lacca blu notte.

In entrambi il collare e' cremisi come la divisa della scuola, con filetti
argento (Bianco) o oro (Nero); il cavallo ha la criniera cremisi a punte e
l'alfiere il taglio cremisi.

Rigenerare (serve Node e Python con Pillow):

```
cd tools/pieces3d
npm install
npm install playwright        # oppure CHROME_PATH=/percorso/chrome
node render.js out-anime '{"variant":"anime"}'   # Classroom: 12 PNG 1024x1280
python3 finalize.py out-anime ../../assets/pieces/cote 256 anime
node render.js out-real                          # Elite 3D
python3 finalize.py out-real ../../assets/pieces/elite 256 real
```

- `scene.js`: forme dei pezzi (profili torniti, criniera e testa del cavallo
  "gonfiate" da una sagoma 2D), materiali, luci e inquadratura.
- `finalize.py`: aggiunge un contorno sottile (scuro sul Bianco, chiaro sul Nero)
  per leggere i pezzi su qualsiasi casa e salva i WebP.
- Le immagini sono piu' alte della casa (rapporto 1.25): la base sta sulla casa,
  re e donna sporgono verso l'alto. `PIECE_SETS.elite.ratio` in
  `chess/board-view.js` deve restare uguale a `ratio` in `scene.js`.
