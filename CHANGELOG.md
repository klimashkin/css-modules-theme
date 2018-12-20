# Changelog

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