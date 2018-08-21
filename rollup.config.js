import _ from 'lodash';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
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
      {spec: specs.ES5, ext: 'es'}, {spec: specs.ES2015, ext: specs.ES2015}, {spec: specs.ES2018, ext: specs.ES2018},
    ],
  },
};

export default function({packageName, umdName, input, getExtraConfig = () => {}, getExtraPresets, getExtraPlugins}) {
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
              customResolveOptions: {
                moduleDirectory: 'node_modules',
              },
            }),
            babel({
              exclude: 'node_modules/**',
              ...getPluginsForSpec(spec, getExtraPresets, getExtraPlugins)
            }),
            compress && terser(),
          ]),
        },
        getExtraConfig({target, format, specs, spec, ext})
      ));

      return config;
    }, [])),
  [])
}
