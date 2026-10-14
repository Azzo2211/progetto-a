const http = require('http'), fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
});
(async () => {
  await new Promise((r) => server.listen(8791, r));
  const outDir = process.argv[2] || path.join(root, 'out');
  const cfg = JSON.parse(process.argv[3] || '{}');
  const query = process.argv[4] || '';
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1100, height: 1100 } });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto('http://localhost:8791/index.html?' + query);
  await p.waitForFunction(() => window.sceneReady, null, { timeout: 60000 });
  for (const color of ['w', 'b']) for (const t of ['K', 'Q', 'R', 'B', 'N', 'P']) {
    const url = await p.evaluate(([t, c, cfg]) => window.renderPiece(t, c, cfg), [t, color, cfg]);
    fs.writeFileSync(path.join(outDir, `${color}${t}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close(); server.close();
  console.log('done');
})();
