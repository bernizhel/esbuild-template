import ESBuild from 'esbuild';
import config from './esbuild.config';

ESBuild.build({
  ...config,
})
  .then(() => console.log('The production build is complete'))
  .catch(console.log);
