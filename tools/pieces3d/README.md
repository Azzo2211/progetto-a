# Pezzi "Elite" (generatore)

Il set `assets/pieces/elite/` e' disegnato qui, in 3D, e poi fotografato in
immagini WebP (256x320, trasparenti). Stile: Classroom of the Elite — il Bianco
in porcellana con filetti argento, il Nero in lacca blu notte con filetti oro,
tutti con il collare cremisi della divisa; il cavallo ha la criniera cremisi a
punte e l'alfiere il taglio cremisi.

Rigenerare (serve Node e Python con Pillow):

```
cd tools/pieces3d
npm install
npm install playwright        # oppure CHROME_PATH=/percorso/chrome
node render.js out            # 12 PNG 1024x1280
python3 finalize.py out ../../assets/pieces/elite 256
```

- `scene.js`: forme dei pezzi (profili torniti, criniera e testa del cavallo
  "gonfiate" da una sagoma 2D), materiali, luci e inquadratura.
- `finalize.py`: aggiunge un contorno sottile (scuro sul Bianco, chiaro sul Nero)
  per leggere i pezzi su qualsiasi casa e salva i WebP.
- Le immagini sono piu' alte della casa (rapporto 1.25): la base sta sulla casa,
  re e donna sporgono verso l'alto. `PIECE_SETS.elite.ratio` in
  `chess/board-view.js` deve restare uguale a `ratio` in `scene.js`.
