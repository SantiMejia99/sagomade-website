#!/usr/bin/env node
// Deterministic frame renderer for the playground grid animations.
//
// Each scene is an HTML page in scenes/ that exposes `window.SCENE = { frames, ready, render(frame) }`.
// The page draws frame N at time N / 30 s; nothing reads the wall clock or unseeded randomness, so the same
// frame number always produces the same pixels.
//
// Usage:
//   NODE_PATH=<dir with playwright> node render.cjs <scene> [--frames all|0,45,90] [--scale 2] [--out dir]
//     [--query key=value&...]   extra scene options, e.g. --query wassily=3d
//
// Chrome is launched through a Playwright helper (headless, WebGL via SwiftShader). Its path comes from
// GRID_PW_HELPER, defaulting to the shared helper used when these were first built.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const WIDTH = 480;
const HEIGHT = 376;
const PW_HELPER = process.env.GRID_PW_HELPER || '/Users/santimejia/Desktop/sagomade-retro-work/tools/pw.cjs';

function parseArgs(argv) {
  const args = { scene: argv[0], frames: 'all', scale: 2, out: null, query: '' };
  for (let i = 1; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    args[key] = key === 'scale' ? Number(argv[i + 1]) : argv[i + 1];
  }
  if (!args.scene) throw new Error('usage: node render.cjs <scene> [--frames all|0,45] [--scale 2] [--out dir]');
  args.out = args.out || path.join(ROOT, 'out', args.scene);
  return args;
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
};

function serve() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.normalize(path.join(ROOT, urlPath));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.out, { recursive: true });
  const server = await serve();
  const { port } = server.address();
  const browser = await require(PW_HELPER).launch();
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: args.scale });
    page.on('console', msg => console.log(`[page] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[page error] ${err.message}`));
    await page.goto(`http://127.0.0.1:${port}/scenes/${args.scene}.html?scale=${args.scale}&${args.query}`);
    await page.waitForFunction(() => window.SCENE && window.SCENE.ready, null, { timeout: 60000 });
    await page.evaluate(() => window.SCENE.ready);
    const total = await page.evaluate(() => window.SCENE.frames);
    const frames =
      args.frames === 'all'
        ? [...Array(total).keys()]
        : String(args.frames)
            .split(',')
            .map(n => Number(n) % total);
    for (const n of frames) {
      await page.evaluate(f => window.SCENE.render(f), n);
      const file = path.join(args.out, `${String(n).padStart(4, '0')}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      process.stdout.write(`\r${args.scene}: frame ${n + 1}/${total}`);
    }
    process.stdout.write('\n');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
