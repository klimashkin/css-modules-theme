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
      const classes = theme[key];
      const dependantProps = [];

      for (const anotherKey in theme) {
        if (theme.hasOwnProperty(anotherKey) && anotherKey !== key && theme[anotherKey].includes(classes)) {
          dependantProps.push(anotherKey);
        }
      }

      if (dependantProps.length > 0) {
        dependenciesExist = true;
        result[key] = dependantProps as [string];
      }
    }
  }

  if (dependenciesExist) {
    return result;
  }

  return undefined;
}
