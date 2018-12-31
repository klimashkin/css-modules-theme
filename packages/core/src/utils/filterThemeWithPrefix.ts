import {Theme, Prefix} from '../types';

/**
 * Takes theme object and returns the new one, properties of which start with the given prefix
 *
 * @param {Object} [theme] - Theme object
 * @param {string} [prefix] - Prefix to filter out theme properties that don't start with it
 *
 * @returns {Object}
 *
 * @example
 * filterThemeWithPrefix({a: 'Comp_a', b: 'Comp_b', item-x: 'Comp_item-x', item-y: 'Comp_item-y'}, 'item-');
 * =>
 * {x: 'Comp_item-x', y: 'Comp_item-y'}
 */
export default function filterThemeWithPrefix(theme: Theme, prefix: Prefix): Theme {
  const prefixLength = prefix.length;
  const result: Theme = {};

  // for..in plus indexOf is still the fastest way to filter object
  for (const key in theme) {
    if (theme.hasOwnProperty(key) && key.indexOf(prefix) === 0) {
      result[key.substr(prefixLength)] = theme[key];
    }
  }

  return result;
}
