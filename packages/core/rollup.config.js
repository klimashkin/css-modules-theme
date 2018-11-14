import getRollupConfig from '../../rollup.config';

export default getRollupConfig({
  packageName: 'core',
  umdName: 'cssModulesThemeCore',
  input: 'src/index.ts',
});
