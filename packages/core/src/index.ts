import filterThemeWithPrefix from './utils/filterThemeWithPrefix';
import * as T from './types';

const Compose = T.Compose;
export type Prefix = T.Prefix;
export type Theme = T.Theme;
export type ThemeOptions = T.ThemeOptions;
export type ComposedThemesCacheItem = T.ComposedThemesCacheItem;
export type ComposedThemesCacheMap = T.ComposedThemesCacheMap;
export type PrefixedThemesCacheMap = T.PrefixedThemesCacheMap;

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
 * @param {Object[]} themes - React props object that will be searched for the following properties
 * @param {Object} [themes[].theme] - Theme object to compose
 * @param {string} [themes[].compose] - Method of composition of current theme with previous one
 * @param {string} [themes[].prefix] - Prefix to filter out properties in current theme before composition
 * @param {boolean} [themes[].noCache=false] - Whether composed theme should not be cached for specified params.
 *
 * @returns {Object}
 */
const composeTheme = (themes: ThemeOptions[]): Theme => {
  const first = themes[0];
  let cacheCheck = !first.noCache;
  let composeMethod = first.compose || Compose.Merge;
  let resultTheme: Theme;

  if (first.prefix) {
    resultTheme = getCachedPrefixedTheme(first.theme, first.prefix);
  } else {
    resultTheme = first.theme;
  }

  for (let i = 1; i < themes.length; i++) {
    const {theme, prefix, compose, noCache = false} = themes[i];
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
            composedTheme[key] = `${resultTheme[key]} ${composedThemeValue}` ;
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
