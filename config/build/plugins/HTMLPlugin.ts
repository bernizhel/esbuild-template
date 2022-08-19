import { Plugin } from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import parse from 'node-html-parser';

const ROOT = process.env.ROOT ?? '';
if (!ROOT) {
  console.error('The ROOT environment variable is not defined.');
  process.exit(1);
}

interface HTMLPluginOptions {
  path: string;
  minify?: boolean;
  jsPaths?: string[];
  cssPaths?: string[];
}

const renderHtml = async (options: HTMLPluginOptions): Promise<string> => {
  const htmlIn = await fs.readFile(options.path, { encoding: 'utf-8' });
  const root = parse(htmlIn);
  root
    .querySelector('head')
    ?.appendChild(
      parse(
        options?.cssPaths
          ?.map((cssPath) => `<link href=${cssPath} rel="stylesheet">`)
          .join('\n') ?? ''
      )
    );
  root
    .querySelector('body')
    ?.appendChild(
      parse(
        options?.jsPaths
          ?.map((jsPath) => `<script src=${jsPath}></script>`)
          .join('\n') ?? ''
      )
    );
  if (options.minify) {
    root.removeWhitespace();
  }
  return root.toString();
};

const preparePaths = (outputs: string[]) => {
  const jsPaths: string[] = [];
  const cssPaths: string[] = [];
  outputs.forEach((output) => {
    if (output.match(/\.js$/i)) {
      jsPaths.push(output.slice(output.indexOf(path.sep) + 1));
    } else if (output.match(/\.css$/i)) {
      cssPaths.push(output.slice(output.indexOf(path.sep) + 1));
    }
  });
  return [jsPaths, cssPaths];
};

export const HTMLPlugin = (options: HTMLPluginOptions): Plugin => {
  return {
    name: 'HTMLPlugin',
    setup(build) {
      build.onEnd(async (result) => {
        const outputs = result?.metafile?.outputs;
        if (!outputs) {
          return;
        }
        const [jsPaths, cssPaths] = preparePaths(Object.keys(outputs ?? {}));
        const htmlOut = await renderHtml({ ...options, jsPaths, cssPaths });
        const outdir =
          build.initialOptions.outdir || path.resolve(ROOT, 'build');
        if (outdir) {
          await fs.writeFile(path.resolve(outdir, 'index.html'), htmlOut);
        }
      });
    },
  };
};
