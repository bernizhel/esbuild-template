import { Plugin } from 'esbuild';
import { existsSync, mkdirSync } from 'fs';
import { rm } from 'fs/promises';

export const CleanPlugin: Plugin = {
  name: 'CleanPlugin',
  setup(build) {
    build.onStart(async () => {
      try {
        // For security reasons the CleanPlugin will work only if the outdir build option is specified
        const outdir = build.initialOptions.outdir;
        if (!outdir) {
          console.error(
            'The outdir build option has not been read or appeared to be empty. Due to that the CleanPlugin will not work.'
          );
          process.exit(1);
        }
        if (!existsSync(outdir)) {
          mkdirSync(outdir);
        }
        await rm(outdir, { recursive: true });
      } catch (err) {
        console.log(
          'An error occurred while trying to clear the build folder: ' + err
        );
      }
    });
  },
};
