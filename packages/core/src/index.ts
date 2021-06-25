import filterThemeWithPrefix from './utils/filterThemeWithPrefix';
import getThemeCompositionDependencies from './utils/getThemeCompositionDependencies';
import {
  Theme, ThemeOptions, Prefix,
  Compose, ComposedThemesCacheItem, ComposedThemesCacheMap,
  PrefixedThemesCacheItem, PrefixedThemesCacheMap, ThemeDependencies, ThemeDependenciesCacheMap,
} from './types';

const composedThemesCacheMap: ComposedThemesCacheMap = new WeakMap();
const prefixedThemesCacheMap: PrefixedThemesCacheMap = new WeakMap();
const dependenciesCacheMap: ThemeDependenciesCacheMap = new WeakMap();

/**
 * Filter theme object with a given prefix and cache the result which will be used on subsequent calls with the same params
 * See {@link filterThemeWithPrefix} for parameters list
 */
const getCachedPrefixedTheme = (theme: Theme, prefix: Prefix): Theme => {
  let ownPrefixedItems = prefixedThemesCacheMap.get(theme);
  let ownPrefixeditem;

  if (ownPrefixedItems === undefined) {
    ownPrefixedItems = [];
    prefixedThemesCacheMap.set(theme, ownPrefixedItems);
  } else {
    ownPrefixeditem = ownPrefixedItems.find((item: PrefixedThemesCacheItem) => item.theme === theme && item.prefix === prefix);
  }

  if (ownPrefixeditem === undefined) {
    ownPrefixeditem = {theme, prefix, finalTheme: filterThemeWithPrefix(theme, prefix)};
    ownPrefixedItems.push(ownPrefixeditem);
  }

  return ownPrefixeditem.finalTheme;
};

/**
 * Search theme object for a class composition and cache the result which will be used on subsequent calls with the same params
 * See {@link getThemeCompositionDependencies} for parameters list
 */
const getCachedThemeCompositionDependencies = (theme: Theme): ThemeDependencies | void => {
  let dependencies = dependenciesCacheMap.get(theme);

  if (dependencies === undefined) {
    dependencies = getThemeCompositionDependencies(theme);

    if (dependencies !== undefined) {
      dependenciesCacheMap.set(theme, dependencies);
    }
  }

  return dependencies;
};

/**
 * Takes an array of objects, which contain themes and options, and returns a composed theme
 *
 * @param {Object[]} options
 * @param {Object} [options[].theme] - Theme object to compose
 * @param {string} [options[].compose] - Method of composition of current theme with previous one
 * @param {string} [options[].prefix] - Prefix to filter out properties in current theme before composition
 * @param {boolean} [options[].noCache=false] - Whether composed theme should not be cached for specified params.
 *
 * @returns {Object}
 */
const composeTheme = (options: ThemeOptions[]): Theme => {
  const first = options[0];
  let checkCache = first.noCache !== true;
  let composeMethod = typeof first.compose === 'string' ? first.compose : Compose.Merge;
  let resultTheme: Theme;
  let dependencies;

  if (typeof first.prefix === 'string' && first.prefix.length > 0) {
    resultTheme = getCachedPrefixedTheme(first.theme, first.prefix);
  } else {
    resultTheme = first.theme;
  }

  for (let i = 1; i < options.length; i++) {
    const {theme, prefix, compose, noParseComposes, noCache = false} = options[i];
    const parseComposes = typeof noParseComposes === 'boolean' ? noParseComposes === false : first.noParseComposes !== true;

    if (typeof compose === 'string') {
      composeMethod = compose;
    }

    if (noCache && checkCache) {
      checkCache = false;
    }

    let composedCachedItem;

    if (checkCache && composeMethod !== Compose.Replace) {
      let composedThemesCache = composedThemesCacheMap.get(theme);

      if (composedThemesCache === undefined) {
        composedThemesCache = [];
        composedThemesCacheMap.set(theme, composedThemesCache);
      } else {
        composedCachedItem = composedThemesCache.find((item: ComposedThemesCacheItem) =>
          item.againstTheme === resultTheme && item.prefix === prefix &&
          item.composeMethod === composeMethod && item.parseComposes === parseComposes
        );

        if (composedCachedItem !== undefined) {
          resultTheme = composedCachedItem.composedTheme;
          continue;
        }
      }

      composedCachedItem = {againstTheme: resultTheme, prefix, composeMethod, parseComposes} as ComposedThemesCacheItem;

      composedThemesCache.push(composedCachedItem);
    }

    let composedTheme;

    if (typeof prefix === 'string' && prefix.length > 0) {
      composedTheme = (noCache ? filterThemeWithPrefix : getCachedPrefixedTheme)(theme, prefix);
    } else {
      composedTheme = theme;
    }

    if (composeMethod === Compose.Replace) {
      resultTheme = composedTheme;

      if (parseComposes && i < options.length - 1) {
        dependencies = checkCache ? getCachedThemeCompositionDependencies(resultTheme) : getThemeCompositionDependencies(resultTheme);
      }

      continue;
    }

    // Get composition dependensies ('composes') of the first theme only when it's needed by the second one
    if (i === 1 && noParseComposes !== true) {
      dependencies = checkCache ? getCachedThemeCompositionDependencies(first.theme) : getThemeCompositionDependencies(first.theme);
    }

    if (composeMethod === Compose.Merge) {
      const composedThemeOriginal = composedTheme;

      composedTheme = {...resultTheme};

      for (const key in composedThemeOriginal) {
        if (composedThemeOriginal.hasOwnProperty(key)) {
          const targetClasses = composedTheme[key];
          let composingClasses = composedThemeOriginal[key];

          if (targetClasses !== undefined) {
            composingClasses = `${targetClasses} ${composingClasses}`;

            // Check if other classes depend on this one, and update them as well
            if (parseComposes === true && dependencies !== undefined && dependencies[key] !== undefined) {
              const targetClassRegex = new RegExp(`\\b${targetClasses}\\b`);

              for (const otherKey of dependencies[key]) {
                // Don't need to check for hasOwnProperty since we create dependencies with Object.create(null)
                composedTheme[otherKey] = composedTheme[otherKey].replace(targetClassRegex, composingClasses);
              }
            }
          }

          composedTheme[key] = composingClasses;
        }
      }
    } else if (composeMethod === Compose.Assign) {
      if (dependencies === undefined || parseComposes === false) {
        composedTheme = {...resultTheme, ...composedTheme};
      } else {
        const composedThemeOriginal = composedTheme;

        composedTheme = {...resultTheme};

        for (const key in composedThemeOriginal) {
          if (composedThemeOriginal.hasOwnProperty(key)) {
            const targetClasses = composedTheme[key];
            const composingClasses = composedThemeOriginal[key];

            // Check if other classes depend on this one, and update them as well
            if (dependencies[key] !== undefined) {
              const targetClassRegex = new RegExp(`\\b${targetClasses}\\b`);

              for (const otherKey of dependencies[key]) {
                // Don't need to check for hasOwnProperty since we create dependencies with Object.create(null)
                composedTheme[otherKey] = composedTheme[otherKey].replace(targetClassRegex, composingClasses);
              }
            }

            composedTheme[key] = composingClasses;
          }
        }
      }
    }

    if (composedCachedItem !== undefined) {
      composedCachedItem.composedTheme = composedTheme;
    }

    resultTheme = composedTheme;
  }

  return resultTheme;
};

export {
  Theme, ThemeOptions, Prefix,
  Compose, ComposedThemesCacheItem, ComposedThemesCacheMap,
  PrefixedThemesCacheItem, PrefixedThemesCacheMap, ThemeDependencies, ThemeDependenciesCacheMap,
};

export {
  composeTheme, filterThemeWithPrefix, getThemeCompositionDependencies,
  getCachedPrefixedTheme, getCachedThemeCompositionDependencies,
};
