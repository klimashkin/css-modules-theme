import filterThemeWithPrefix from './utils/filterThemeWithPrefix';
import {
  Compose, ComposedThemesCacheItem, ComposedThemesCacheMap,
  PrefixedThemesCacheMap, ThemeOptions, Theme, Prefix,
} from './types';

const composedThemesCacheMap: ComposedThemesCacheMap = new WeakMap();
const prefixedThemesCacheMap: PrefixedThemesCacheMap = new WeakMap();

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
    ownPrefixeditem = ownPrefixedItems.find(item => item.theme === theme && item.prefix === prefix);
  }

  if (ownPrefixeditem === undefined) {
    ownPrefixeditem = {theme, prefix, finalTheme: filterThemeWithPrefix(theme, prefix)};
    ownPrefixedItems.push(ownPrefixeditem);
  }

  return ownPrefixeditem.finalTheme;
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
  let cacheCheck = !first.noCache;
  let composeMethod = first.compose || Compose.Merge;
  let resultTheme: Theme;

  if (first.prefix) {
    resultTheme = getCachedPrefixedTheme(first.theme, first.prefix);
  } else {
    resultTheme = first.theme;
  }

  for (let i = 1; i < options.length; i++) {
    const {theme, prefix, compose, noCache = false} = options[i];
    let composedTheme;

    if (compose) {
      composeMethod = compose;
    }

    if (noCache && cacheCheck) {
      cacheCheck = false;
    }

    let composedCachedItem;

    if (cacheCheck && composeMethod !== Compose.Replace) {
      let composedThemesCache = composedThemesCacheMap.get(theme);

      if (composedThemesCache === undefined) {
        composedThemesCache = [];
        composedThemesCacheMap.set(theme, composedThemesCache);
      } else {
        composedCachedItem = composedThemesCache.find(
          item => item.againstTheme === resultTheme && item.prefix === prefix && item.composeMethod === composeMethod
        );

        if (composedCachedItem !== undefined) {
          resultTheme = composedCachedItem.composedTheme;
          continue;
        }
      }

      composedCachedItem = {againstTheme: resultTheme, prefix, composeMethod} as ComposedThemesCacheItem;

      composedThemesCache.push(composedCachedItem);
    }

    if (typeof prefix === 'string' && prefix.length > 0) {
      composedTheme = (noCache ? filterThemeWithPrefix : getCachedPrefixedTheme)(theme, prefix);
    } else {
      composedTheme = theme;
    }

    if (composeMethod === Compose.Replace) {
      resultTheme = composedTheme;
      continue;
    }

    if (composeMethod === Compose.Merge) {
      composedTheme = {...composedTheme};

      for (const key in resultTheme) {
        if (resultTheme.hasOwnProperty(key)) {
          const composedThemeValue = composedTheme[key];

          if (composedThemeValue === undefined) {
            composedTheme[key] = resultTheme[key];
          } else {
            composedTheme[key] = `${resultTheme[key]} ${composedThemeValue}`;
          }
        }
      }
    } else if (composeMethod === Compose.Assign) {
      composedTheme = {...resultTheme, ...composedTheme};
    }

    if (composedCachedItem !== undefined) {
      composedCachedItem.composedTheme = composedTheme;
    }

    resultTheme = composedTheme;
  }

  return resultTheme;
};

export {Compose, composeTheme, getCachedPrefixedTheme};
