/**
 * Takes theme styles object and returns the new one, properties of which start with given prefix
 *
 * @param {Object} theme - Styles object
 * @param {string} prefix - Properties prefix
 *
 * @example
 * filterThemeWithPrefix({a: 'Comp_a', b: 'Comp_b', item-x: 'Comp_item-x', item-y: 'Comp_item-y'}, 'item-');
 * =>
 * {x: 'Comp_item-x', y: 'Comp_item-y'}
 */
export default function filterThemeWithPrefix(theme, prefix) {
  const prefixLength = prefix.length;
  const result = {};

  // for..in plus indexOf is still the fastest way to filter object
  for (const key in theme) {
    if (theme.hasOwnProperty(key) && key.indexOf(prefix) === 0) {
      result[key.substr(prefixLength)] = theme[key];
    }
  }

  return result;
}