import _ from 'lodash';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import {specs, getPluginsForSpec} from './scripts/babelTargets';

const targets = {
  browser: {
    format: 'umd', specs: [
      {spec: specs.ES5, compress: true},
    ],
  },
  main: {
    format: 'cjs', specs: [
      {spec: specs.ES5},
    ],
  },
  module: {
    format: 'es', specs: [
      {spec: specs.ES5, ext: 'es'},
      {spec: specs.ES2015, ext: specs.ES2015},
      {spec: specs.ES2018, ext: specs.ES2018},
      {spec: specs.ES2019, ext: specs.ES2019},
    ],
  },
};

export default function ({packageName, umdName, input, getExtraConfig = () => {}, getExtraPresets, getExtraPlugins}) {
  return Object.entries(targets).reduce((config, [target, {format, specs}]) =>
    config.concat(specs.reduce((config, {spec, ext = format, compress = false}) => {
      config.push(_.merge(
        {
          input: `${input}`,
          output: {
            format,
            name: umdName,
            sourcemap: compress,
            file: `dist/${packageName}.${ext}.js`,
          },
          plugins: _.compact([
            resolve({
              extensions: ['.ts', '.tsx'],
              customResolveOptions: {
                moduleDirectory: 'node_modules',
              },
            }),
            typescript({
              check: true,
              clean: true,
              verbosity: 1,
              abortOnError: true,
              tsconfig: './tsconfig.compiler.json',
              tsconfigOverride: {
                compilerOptions: {
                  composite: false,
                  declaration: false,
                  declarationMap: false,

                  baseUrl: '.',
                  paths: {
                    '@css-modules-theme/core': ['packages/core/src'],
                    '@css-modules-theme/core/types': ['packages/core/src/types'],
                  },
                },
              },
            }),
            babel({
              exclude: 'node_modules/**',
              extensions: ['.ts', '.tsx'],
              ...getPluginsForSpec(spec, getExtraPresets, getExtraPlugins),
            }),
            compress && terser({sourcemap: compress}),
          ]),
        },
        getExtraConfig({target, format, specs, spec, ext})
      ));

      return config;
    }, [])),
  []);
}
