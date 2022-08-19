import { BuildOptions } from 'esbuild';
import path from 'path';
import { CleanPlugin } from './plugins/CleanPlugin';
import { HTMLPlugin } from './plugins/HTMLPlugin';

const MODE = process.env.MODE || 'development';

const isDev = MODE === 'development';
const isProd = MODE === 'production';

const ROOT = process.env.ROOT ?? '';
if (!ROOT) {
  console.error('The ROOT environment variable is not defined.');
  process.exit(1);
}

function resolveRoot(...segments: string[]) {
  return path.resolve(ROOT, ...segments);
}

const config: BuildOptions = {
  outdir: resolveRoot('build'),
  entryPoints: [resolveRoot('src', 'index.tsx')],
  entryNames: '[dir]/bundle.[hash]',
  bundle: true,
  tsconfig: resolveRoot('tsconfig.json'),
  minify: isProd,
  sourcemap: isDev,
  metafile: true,
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
  },
  plugins: [
    CleanPlugin,
    HTMLPlugin({ path: resolveRoot('public', 'index.html'), minify: isProd }),
  ],
};

export default config;
