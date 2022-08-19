import ESBuild from 'esbuild';
import config from './esbuild.config';
import express from 'express';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import parse from 'node-html-parser';
import path from 'path';

const PORT = Number(process.env.PORT) || 3000;

const ROOT = process.env.ROOT ?? '';
if (!ROOT) {
  console.error('The ROOT environment variable is not defined.');
  process.exit(1);
}
const OUTDIR = config.outdir || path.resolve(ROOT, 'build');

const app = express();
const emitter = new EventEmitter();

app.use(express.static(OUTDIR));

app.get('/subscribe', (_, response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  response.writeHead(200, headers);
  emitter.on('refresh', () => {
    response.write('data: {}]\n\n');
  });
});

app.listen(PORT, () =>
  console.log('The server is running on http://localhost:' + PORT)
);

// This function adds the following script tag to the built html file to make my HMR work
async function addScriptToBundleHtml() {
  const htmlFiles = (await fs.readdir(OUTDIR)).filter((file) =>
    file.endsWith('.html')
  );
  let htmlPath = '';
  if (htmlFiles.includes('index.html')) {
    htmlPath = path.resolve(OUTDIR, 'index.html');
  } else {
    htmlPath = htmlFiles[0];
  }
  const html = await fs.readFile(htmlPath, { encoding: 'utf-8' });
  const root = parse(html);
  root.querySelector('body')?.appendChild(
    parse(`
<script>
  const eventSource = new EventSource('http://localhost:3000/subscribe');
  eventSource.onmessage = () => {
    window.location.reload();
  }
</script>
`)
  );
  await fs.writeFile(htmlPath, root.toString());
}

ESBuild.build({
  ...config,
  watch: {
    onRebuild(err) {
      if (err) {
        console.log(err);
      } else {
        addScriptToBundleHtml();
        console.log('Rebuilding the bundle...');
        emitter.emit('refresh');
      }
    },
  },
})
  .then(() => {
    addScriptToBundleHtml();
    console.log('The development build is complete');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
