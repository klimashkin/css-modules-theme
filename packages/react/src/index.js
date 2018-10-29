import {composeTheme, COMPOSE_MERGE, COMPOSE_ASSIGN, COMPOSE_REPLACE} from '@css-modules-theme/core';

/**
 * Takes theme styles object and returns a composed one, properties of which optionally start with given prefix
 *
 * @param {Object} ownTheme - Own styles object of component
 *
 * @param {Object|Object[]} propsOrContext - React props object that will be searched for the following properties
 * @param {Object} propsOrContext - React props object that will be searched for the following properties
 * @param {Object} [propsOrContext.theme] - Theme object to compose with ownTheme
 * @param {string} [propsOrContext.themeCompose] - Method of themes composition
 * @param {string} [propsOrContext.themePrefix] - Prefix to filter out properties in 'props.theme' that don't satisfy that prefix
 * @param {boolean} [propsOrContext.themeNoCache=false] - Whether composed theme should not be cached for specified params.
 *                                               Useful when 'props.theme' is diverse and generated on each render,
 *                                               then don't need to waste memory to cache result and time for looking it up
 *
 * @param {Object} options - Options with following properties
 * @param {string} [options.prefix] - Prefix to filter out properties in 'ownTheme' that don't satisfy that prefix
 * @param {string} [options.compose] - Default composition method, if props.themeCompose is unspecified
 * @param {string} [options.noCache] - Default noCache flag if props.themeNoCache is unspecified
 *
 * @example
 * import {getThemeFromProps} from 'css-modules-theme-react';
 *
 * getThemeFromProps(
 *   {x: 'Comp1_x', y: 'Comp1_y', z: 'Comp1_z'},
 *   {theme: {a: 'Comp2_a', b: 'Comp2_b', item-x: 'Comp2_item-x', item-y: 'Comp2_item-y'}, themePrefix: 'item-'},
 *   {compose: 'merge'}
 * );
 * =>
 * {x: 'Comp1_x Comp2_item-x', y: 'Comp1_y Comp2_item-y', z: 'Comp1_z}
 */
export const getThemeFromProps = (ownTheme, propsOrContext, options = {}) => {
  const themes = [{
    theme: ownTheme,
    prefix: options.prefix,
    noCache: options.noCache,
    compose: options.compose,
  }];

  if (Array.isArray(propsOrContext)) {
    for (const item of propsOrContext) {
      if (item && item.theme) {
        themes.push({
          theme: item.theme,
          prefix: item.themePrefix,
          noCache: item.themeNoCache,
          compose: item.themeCompose,
        });
      }
    }
  } else if (propsOrContext.theme) {
    themes.push({
      theme: propsOrContext.theme,
      prefix: propsOrContext.themePrefix,
      noCache: propsOrContext.themeNoCache,
      compose: propsOrContext.themeCompose,
    });
  }

  return composeTheme(themes);
};

/**
 * Helper on top of getThemeFromProps,
 * that returns new props object with deprived theme* properties from original one and mixed result `theme`
 *
 * See {@link getThemeFromProps} for parameters list
 *
 * @example
 * import {mixThemeWithProps} from 'css-modules-theme-react';
 *
 * const {theme, onClick, ...restProps} = mixThemeWithProps(styles, this.props);
 */
export const mixThemeWithProps = (ownTheme, propsOrContext, options = {}) => {
  const props = options.props || (Array.isArray(propsOrContext) ? propsOrContext[0] : propsOrContext);
  const {theme, themePrefix, themeCompose, themeNoCache, ...restProps} = props;

  restProps.theme = getThemeFromProps(ownTheme, propsOrContext, options);

  return restProps;
};

// Reexport core constants
export {COMPOSE_MERGE, COMPOSE_ASSIGN, COMPOSE_REPLACE};

