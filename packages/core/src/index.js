import filterThemeWithPrefix from './utils/filterThemeWithPrefix';

export const COMPOSE_MERGE = 'merge';
export const COMPOSE_ASSIGN = 'assign';
export const COMPOSE_REPLACE = 'replace';

const getOwnPrefixedTheme = (() => {
  const ownPrefixedThemesMap = new WeakMap();

  return (theme, prefix) => {
    let ownPrefixedItems = ownPrefixedThemesMap.get(theme);
    let ownPrefixeditem;

    if (ownPrefixedItems) {
      ownPrefixeditem = ownPrefixedItems.find(item => item.theme === theme && item.prefix === prefix);
    } else {
      ownPrefixedItems = [];
      ownPrefixedThemesMap.set(theme, ownPrefixedItems);
    }

    if (ownPrefixeditem === undefined) {
      ownPrefixeditem = {theme, prefix, finalTheme: filterThemeWithPrefix(theme, prefix)};
      ownPrefixedItems.push(ownPrefixeditem);
    }

    return ownPrefixeditem.finalTheme;
  };
})();

const composeThemes = (ownTheme, injectTheme, injectPrefix, compose) => {
  const checkPrefix = typeof injectPrefix === 'string' && injectPrefix.length > 0;
  const passedTheme = checkPrefix ? filterThemeWithPrefix(injectTheme, injectPrefix) : injectTheme;

  if (compose === COMPOSE_MERGE) {
    // Don't need to clone one more time if keys have been filtered
    const result = checkPrefix ? passedTheme : {...passedTheme};

    for (const key in ownTheme) {
      if (ownTheme.hasOwnProperty(key)) {
        const passedThemeValue = passedTheme[key];

        if (passedThemeValue === undefined) {
          result[key] = ownTheme[key];
        } else {
          result[key] = ownTheme[key] + ' ' + passedThemeValue;
        }
      }
    }

    return result;
  }

  if (compose === COMPOSE_REPLACE) {
    return passedTheme;
  }

  if (compose === COMPOSE_ASSIGN) {
    return {...ownTheme, ...passedTheme};
  }

  return ownTheme;
};

const getCachedComposedTheme = (() => {
  const composedThemesMap = new WeakMap();

  return (ownTheme, injectTheme, prefix, compose) => {
    let composedThemes = composedThemesMap.get(injectTheme);

    if (composedThemes !== undefined) {
      const composedItem = composedThemes.find(
        item => item.ownTheme === ownTheme && item.prefix === prefix && item.compose === compose
      );

      if (composedItem !== undefined) {
        return composedItem.composedTheme;
      }
    } else {
      composedThemes = [];
      composedThemesMap.set(injectTheme, composedThemes);
    }

    const composedItem = {
      ownTheme, prefix, compose, count: 1,
      composedTheme: composeThemes(ownTheme, injectTheme, prefix, compose),
    };

    composedThemes.push(composedItem);

    return composedItem.composedTheme;
  };
})();

export const getTheme = (ownTheme, injectTheme, {ownPrefix, injectPrefix, compose = COMPOSE_MERGE, noCache = false} = {}) => {
  if (typeof ownPrefix === 'string' && ownPrefix.length > 0) {
    ownTheme = getOwnPrefixedTheme(ownTheme, ownPrefix);
  }

  if (!injectTheme) {
    return ownTheme;
  }

  return (noCache ? composeThemes : getCachedComposedTheme)(ownTheme, injectTheme, injectPrefix, compose);
};
