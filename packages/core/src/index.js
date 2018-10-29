import filterThemeWithPrefix from './utils/filterThemeWithPrefix';

const composedThemesCacheMap = new WeakMap();
const prefixedThemesCacheMap = new WeakMap();

export const COMPOSE_MERGE = 'merge';
export const COMPOSE_ASSIGN = 'assign';
export const COMPOSE_REPLACE = 'replace';

export const getCachedPrefixedTheme = (theme, prefix) => {
  let ownPrefixedItems = prefixedThemesCacheMap.get(theme);
  let ownPrefixeditem;

  if (ownPrefixedItems) {
    ownPrefixeditem = ownPrefixedItems.find(item => item.theme === theme && item.prefix === prefix);
  } else {
    ownPrefixedItems = [];
    prefixedThemesCacheMap.set(theme, ownPrefixedItems);
  }

  if (ownPrefixeditem === undefined) {
    ownPrefixeditem = {theme, prefix, finalTheme: filterThemeWithPrefix(theme, prefix)};
    ownPrefixedItems.push(ownPrefixeditem);
  }

  return ownPrefixeditem.finalTheme;
};

export const composeTheme = themes => {
  const first = themes[0];
  let cacheCheck = !first.noCache;
  let composeMethod = first.compose || COMPOSE_MERGE;
  let resultTheme;

  if (first.prefix) {
    resultTheme = getCachedPrefixedTheme(first.theme, first.prefix);
  } else {
    resultTheme = first.theme;
  }

  for (let i = 1; i < themes.length; i++) {
    let {theme, prefix, compose, noCache = false} = themes[i];
    const withPrefix = typeof prefix === 'string' && prefix.length > 0;
    let composedTheme;

    if (compose) {
      composeMethod = compose;
    }

    if (noCache && cacheCheck) {
      cacheCheck = false;
    }

    let composedCachedItem;

    if (cacheCheck && composeMethod !== COMPOSE_REPLACE) {
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

      composedCachedItem = {
        againstTheme: resultTheme, prefix, composeMethod: composeMethod,
      };

      composedThemesCache.push(composedCachedItem);
    }

    if (withPrefix) {
      composedTheme = (noCache ? filterThemeWithPrefix : getCachedPrefixedTheme)(theme, prefix);
    } else {
      composedTheme = theme;
    }

    if (composeMethod === COMPOSE_REPLACE) {
      resultTheme = composedTheme;
      continue;
    }

    if (composeMethod === COMPOSE_MERGE) {
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
    } else if (composeMethod === COMPOSE_ASSIGN) {
      composedTheme = {...resultTheme, ...composedTheme};
    }

    if (composedCachedItem !== undefined) {
      composedCachedItem.composedTheme = composedTheme;
    }

    resultTheme = composedTheme;
  }

  return resultTheme;
};
