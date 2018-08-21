import {specs} from '../../scripts/babelTargets';
import getRollupConfig from '../../rollup.config';

export default getRollupConfig({
  packageName: 'react',
  umdName: 'css-modules-theme-react',
  input: 'src/index.js',
  getExtraConfig: () => ({
    external: ['@css-modules-theme/core'],
    output: {
      globals: {
        '@css-modules-theme/core': '@css-modules-theme/core'
      },
    },
  }),
  getExtraPlugins: spec => [['@babel/plugin-transform-react-jsx', {useBuiltIns: spec !== specs.ES5}]]
});
