import {specs} from '../../scripts/babelTargets';
import getRollupConfig from '../../rollup.config';

export default getRollupConfig({
  packageName: 'react',
  umdName: 'cssModulesThemeReact',
  input: 'src/index.ts',
  getExtraConfig: () => ({
    external: ['@css-modules-theme/core'],
    output: {
      globals: {
        '@css-modules-theme/core': 'cssModulesThemeCore'
      },
    },
  }),
  getExtraPlugins: spec => [['@babel/plugin-transform-react-jsx', {useBuiltIns: spec !== specs.ES5}]]
});
