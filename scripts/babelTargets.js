export const specs = {
  ES5: 'es5', ES2015: 'es2015', ES2018: 'es2018',
};

export const getPluginsForSpec = (spec, getExtraPresets = () => [], getExtraPlugins = () => []) => {
  let result;

  if (spec === specs.ES5) {
    result = {
      presets: [
        ['@babel/preset-env', {loose: true, modules: false}],
        ...getExtraPresets(specs.ES5),
      ],
      plugins: getExtraPlugins(specs.ES5),
    };
  } else if (spec === specs.ES2015) {
    result = {
      presets: [
        ...getExtraPresets(specs.ES2015),
      ],
      plugins: [
        ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true}],
        ...getExtraPlugins(specs.ES2015),
      ],
    };
  } else if (spec === specs.ES2018) {
    result = {
      presets: [
        ...getExtraPresets(specs.ES2015),
      ],
      plugins: [
        // To make babel undersdand object-rest-spread syntax without transforming it
        '@babel/plugin-syntax-object-rest-spread',
        ...getExtraPlugins(specs.ES2018),
      ],
    };
  }

  return result;
};
