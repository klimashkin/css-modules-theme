# Changelog

## 2.3.0 (2021-06-25)
* Fix unresolvable types from 'core' (by [Hayden Chen](https://github.com/chbdetta))

## 2.2.2 (2021-06-09)
 * Update missed index.d.ts typings from 2.2.1

## 2.2.1 (2021-06-08)
 * Use UnionOmit for mixThemeWithProps to distribute unions (by [Hayden Chen](https://github.com/chbdetta))
 * Accept React 17 in peerDependencies

## 2.2.0 (2019-09-05)
 * Move to TypeScript 3.6
 * Use @typescript-eslint withESLint 6.3.0
 * Update Babel, Rollup, Jest and otherdev dependencies

## 2.1.3 (2019-01-23)
 * Make sure dependency class names are replaced as a whole words, not as subsets of other classnames
 * Update dependencies
 * Update tests

## 2.1.2 (2018-12-31)
 * Properly handle classnames with the same beginning (2.1.1 was not publish correctly)

## 2.1.0 (2018-12-31)
 * Properly handle static `composes` css rule during runtime composition with `composeTheme`.
 `Icon.css`:
 ```css
 .icon {
   color: green;
 }
 .small {
   composes: icon;
   font-size: 0.5rem;
 }
 .large {
   composes: icon;
   font-size: 2rem;
 }
 ```
 `Button.css`:
 ```css
 .button {
   width: auto;
 }
 .error-icon {
   color: red;
 }
 ```
 ```js
 import {composeTheme} from '@css-modules-theme/core';
 import stylesIcon from './Icon.css';
 // {
 //   icon: 'a',
 //   small: 'b a',
 //   large: 'c a',
 // }
 import stylesButton from './Button.css';
  // {
  //   button: 'x',
  //   'error-icon': 'y',
  // }

 composeTheme([{theme: stylesIcon}, {theme: stylesButton, prefix: 'error-'}]);
 // Result:
 // {
 //   icon: 'a y',
 //   small: 'b a y',
 //   large: 'c a y',
 // }
 ```

 * Core:
   * Add `noParseComposes` boolean option into `composeTheme` that can skip parsing theme for static `composes` rule dependencies.
 * React:
   * Add corresponding `themeNoParseComposes` option to props/context objects

## 2.0.0 (2018-12-19)
 * Multiple themes composition! Now you can compose more than two themes at once, which is useful in React when you want to merge own component styles with ones from props and from react context.
 * Rewrite project in TypeScript!
 * Add testing with Jest!

 * Core:
   * Rename `getTheme` into `composeTheme` that now takes an array of options for each theme
 * React:
   * Rename `getThemeFromProps` into `composeThemeFromProps` that now can take an array as a second argument to get props and context in desired order to set their precedence.

## 1.2.0  (2018-08-27)
 * Update Babel to stable 7
 * React: add [`mixThemeWithProps`](https://github.com/klimashkin/css-modules-theme#mixthemewithprops) method

## 1.1.0  (2018-08-23)
 * Set global amd names to `cssModulesThemeCore` and `cssModulesThemeReact`

## 1.0.0  (2018-08-22)
 * Initial release