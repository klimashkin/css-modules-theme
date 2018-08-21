import getRollupConfig from '../../rollup.config';

export default getRollupConfig({
  packageName: 'core',
  umdName: 'css-modules-theme-core',
  input: 'src/index.js',
});
