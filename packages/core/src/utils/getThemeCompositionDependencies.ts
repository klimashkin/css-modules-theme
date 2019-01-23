import {Theme, ThemeDependencies} from '../types';

/**
 * Find classes in specified theme that are composed into another classes,
 * i.e. classes that have dependencies in another classes.
 * (https://github.com/css-modules/css-modules#composition)
 *
 * @param {Object} [theme] - Theme object
 * @returns {Object}
 *
 * @example
 * Comp.css
 * .a {...}
 * .b { composes: a; ...}
 * .c { composes: b; ...}
 *
 * getThemeDependencies({
 *   a: 'Comp_a',
 *   b: 'Comp_b Comp_a',
 *   c: 'Comp_c Comp_b Comp_a'
 * });
 * =>
 * {a: ['b', 'c'], b: ['c']}
 */
export default function getThemeCompositionDependencies(theme: Theme): ThemeDependencies | undefined {
  const result: ThemeDependencies = Object.create(null);
  let dependenciesExist = false;

  // for..in plus indexOf is still the fastest way to filter object
  for (const key in theme) {
    if (theme.hasOwnProperty(key)) {
      // Don't use /\b${theme[key]}\b/ regex here, indexOf on string wrapped in spaces is much faster
      const search = ` ${theme[key]} `;

      for (const anotherKey in theme) {
        if (theme.hasOwnProperty(anotherKey) && anotherKey !== key && (theme[anotherKey] + ' ').indexOf(search) !== -1) {
          if (result[key] === undefined) {
            dependenciesExist = true;
            result[key] = [anotherKey];
          } else {
            result[key].push(anotherKey);
          }
        }
      }
    }
  }

  if (dependenciesExist) {
    return result;
  }

  return undefined;
}
