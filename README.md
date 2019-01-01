![CSS Modules Theme](https://raw.githubusercontent.com/klimashkin/css-modules-theme/master/logo.svg?sanitize=true "CSS Modules Theme")

[![Written in TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-4e6ef2.svg)](https://www.typescriptlang.org)
[![Maintained with Lerna](https://img.shields.io/badge/Maintained%20with-Lerna-ff9100.svg)](https://lernajs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-00c853.svg)](https://raw.githubusercontent.com/klimashkin/css-modules-theme/master/LICENSE)

- [CSS Modules](#css-modules)
- [Theming](#theming)
- [Packages](#core)
  - [Core](#core)
    * [Composition types](#composition-types)
    * [composeTheme()](#composethemeoptions)
  - [React](#react)
    * [composeThemeFromProps()](#composethemefrompropsowntheme-propsOrContext-options)
    * [mixThemeWithProps()](#mixthemewithprops)
- [Other Libraries](#other-libraries)
- [Bundling](#bundling)
- [Contribution](#contribution)

## CSS Modules
A [CSS Module](https://github.com/css-modules/css-modules) is just a CSS file in which all class names and animation names are transformed on build time to be scoped locally by default.
CSS Modules give you a very powerful way to write ***statically compiled***, ***isolated*** and ***composable*** css selectors, so it become a natural choice in the world of componentized front-end development, like in React.
* Statically compiled, because you generate result css file(s) and corresponding javascript mapping only once on compilation time when you build your assets. That is the main difference between CSS Modules and CSS-in-JS approach, in the first case you get regular css files, in the second you generate css definition in browser during runtime on each component render. Static CSSOM tree is always faster than dynamically generated one - browsers have spent more than 20 years optimizing that work. With CSS Modules you produce final css in build time using loaders for popular bundlers, like for [weback](https://github.com/webpack-contrib/css-loader/#modules) or [rollup](https://github.com/egoist/rollup-plugin-postcss#modules).
* Isolated, because your bundler generates uniq css class names on bundle creation time according to a naming rule you specify. That is called 'local scope', which is the corner stone of CSS, and you get it automatically.
* Composable, because in certain cases you can compose (concatenate) classnames from the same or different files on bundle creation time and avoid utilizing cpu in runtime.

Let's recap on what CSS Module is. On one side it’s just a standard css file, imported value of which on JS side becomes a simple flat object that maps names you give classes during development with the real (generated) class names from that final css file.
For instance, imagine you have the following `Button.css` code:
```css  
.button {  
  display: inline-block;
}  
.primary {  
  background-color: green;  
}  
.secondary {  
  background-color: blue;  
}  
```  
From the above css definition, depending on css-loader setting (when using a module bundler like 'webpack'), we might get generated css like this: 
```css  
.aa {  
  display: inline-block;
}  
.ab {  
  background-color: green;  
}  
.ac {  
  background-color: blue;  
}  
```
And in JavaSctipt you get the following mapping `styles` object after doing `import styles from './Button.css'`:  
```javascript  
{ 
  button: 'aa',
  primary: 'ab',
  secondary: 'ac',
}
```
So, class names that we wrote in css file become keys of a mapping object, while real classname are automatically generated and become values of that object. That's it!
And in your, let's say, react `Button.js` component you can use it this way:
```javascript  
import cx from 'classnames';
import PropTypes from 'prop-types';
import styles from './Button.css';

class Button {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'secondary']),
  }
  static defaultProps = {
    type: 'primary',
  }
  render() {
    return <button type="submit" className={cx(styles.button, styles[this.props.type])}/>
  }
}
```
Which will be rendered into:
```html
<button type="submit" class="aa ab"/>
```
Have you noticed how we took the real classnames from `styles` object simply by accessing property using classnames that we gave in css definition?
Moreover, in case of getting corresponding classname for the passed `type` property we can simply use brackets notation if possible type names are the same as given classnames in css. 
That is superuseful - no ternaries, conditions or superfluous `cx({primary: type === 'primary', secondary: type === 'secondary'})` are needed, which is good for performance and reasoning.

---
Example above illustrates two first concepts of CSS Modules - local scope and build time transformation. Let's illustrate third one - [composition](https://github.com/css-modules/css-modules#composition).
Our Button component will always have some type, which means both `.button` and either `.primary` or `.secondary` classes will be applied. Currently we have to concatenate them in runtime on each render, but we can do better. Let's use `composes` keyword in our `Button.css`:
```css  
.button {  
  display: inline-block;
}  
.primary {
  composes: button; 
  background-color: green;  
}  
.secondary {
  composes: button;
  background-color: blue;  
}  
``` 
Our generated css will still remain the same:
```css  
.aa {
  display: inline-block;
}
.ab {
  background-color: green;  
}
.ac {
  background-color: blue;  
}  
```
But our `styles` object will become:
```javascript  
{ 
  button: 'aa',
  primary: 'ab aa',
  secondary: 'ac aa',
}
```
A-ha! So if we insert `styles.primary` or `styles.secondary` it will actually insert two real classnames: `ab aa` or `ab ac`, and we can simplify our component to:
```javascript  
import PropTypes from 'prop-types';
import styles from './Button.css';

class Button {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'secondary']),
  }
  static defaultProps = {
    type: 'primary',
  }
  render() {
    return <button type="submit" className={styles[this.props.type]}/>
  }
}
```
Produced html will still be the same:
```html
<button type="submit" class="aa ab"/>
``` 
We don't need `cx` in that case anymore! With CSS Modules, if two or more class names always go along with each other, you can compose them in one right in css and they will be concatenated on compilation time!
And you get a little performance boost in runtime for free, you just need to design your css right. And it's not as insignificant as it might seem, you'll appreciate that on complex pages with thousands of small rendered components. You are welcome!

## Theming
Local scope brings a challenge: how to style children component from parent if they are isolated and their real classnames are unknown during development process?
Theming is the answer.

How will a page that uses Button component modify its `primary` styling if it doesn't know real corresponding `ab` classname? With React, we can create a boolean prop in a Button component for each possible style modification. Adding extra prop(s) for css logic can be managable for simple components. As the complexity grows, a component's props combination can grow exponentially making prop management challenging.

The solution to avoid overwhelming a component with boolean props is to take two css-module objects, own one and from parent, and merge them together to get a final object. The first object can be called original theme, or own theme of the component, and the parent one can be called injecting theme since we mix it into the first one. 

**@css-modules-theme** is a project based on two simple ideas:

* First, themes composition must be fast. That means, no producing class instance on each composition, [no hocs](#other-libraries), no fancy multistep map/reduces or third-party helpers, just a few straightforward classic JS loops with minimum transformations. 

* Second, result of that composition should be weakly cached for given parameters and shared between different calls. If we render component that renders another themeable component many times, in vast majority of cases parent component will pass the same theme object to the child, thus result theme can be composed only once, cached and reused by other components from that cache.
To achieve that @css-modules-theme puts injected theme as a key into WeakMap (to free up memory when injected theme is not needed anymore) and composed theme along with options into a value of that map. 
So when you call composeTheme for the first time, it will do the composition and put the result into cache, and all consequent calls with the same arguments will just return the same result from that cache.
From the table example mentioned in [Other Libraries](#other-libraries) section, the new table implementation with **css-modules-theme** was able to reduce the number of compositions from 761 to 42 and total page rendering time (with all content) by **30%**.

Project includes two (for now) scoped packages: [@css-modules-theme/core](https://github.com/klimashkin/css-modules-theme/tree/master/packages/core) and [@css-modules-theme/react](https://github.com/klimashkin/css-modules-theme/tree/master/packages/react)

## Core
Main package that performs all types of composition and which is used by other packages.

* [npm](https://www.npmjs.com/package/@css-modules-theme/core): `npm install @css-modules-theme/core`
* [yarn](https://yarnpkg.com/en/package/@css-modules-theme/core): `yarn add @css-modules-theme/core`
* cdn: Exposed as `cssModulesThemeCore`
  * [Unpkg](https://unpkg.com/@css-modules-theme/core@2.1.2/dist/core.umd.js): `<script src="https://unpkg.com/@css-modules-theme/core@2.1.2/dist/core.umd.js"></script>`
  * [JSDelivr](https://cdn.jsdelivr.net/npm/@css-modules-theme/core@2.1.2/dist/core.umd.js): `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/core@2.1.2/dist/core.umd.js"></script>`

1.8kb module that represents pretty simple singleton which creates WeakMap for caching composed themes and exposes the following method

#### Composition types
As `import {Compose} from '@css-modules-theme/core';`

`Compose` is an object (enum) that exposes available composition methods with following values:
   - `Compose.Merge` - Default way that assigns classnames from current `theme` to the previous one, and concatenate classnames which exist in both themes.
   - `Compose.Assign` - Also assigns classnames from curent `theme` to previous one, like Object.assign, so if classname exists in both, latter takes precedence
   - `Compose.Replace` - Just use current theme

#### `composeTheme([options])`
As `import {composeTheme} from '@css-modules-theme/core';`

Function that returns a new theme as a result of composition of themes in an array of options. Takes the following arguments

 - `options` *(Object)* - option object, one per each theme, with the following properties:
   - `theme` *(Object)* - Theme object to compose with previous one.
   - [`prefix`] *(String)* - Prefix to filter and strip out properties in current `theme` that don't satisfy that prefix, before composition.
   - [`compose`] *(String)* - Method of composition of current `theme` with previous one (for second and following options). Available values are exported by [`Compose`](#compose). If `compose` in current oprions object is absent, it will be taken from the previous or default one.
   - [`noCache = false`] *(Boolean)* - In case you generate current `theme` dynamically (for instance, on each render), there is no reason to cache result, since there might be too many variation of outcome. In that case you can set `noCache` to `true` to skip putting result into cache and looking it up.
   - [`noParseComposes = false`] *(Boolean)* - `composeTheme` will try to detect [`composes`](https://github.com/css-modules/css-modules#composition) rules in css. Set it to `false` if you don't use `composes` and want to safe some cpu

### Examples
Assume we have an Icon component with following theme:
```javascript
const iconStyle = {
  'icon': 'x',
  'small': 'y',
  'medium': 'z'
}
```
and a Button component which wants to render Icon component and pass following theme to it:
```javascript
const buttonStyle = {
  'button': 'a',
  'primary': 'b',
  'secondary': 'c',
  'icon-icon': 'd',
  'icon-small': 'e'
}
```
Now let's compose them using different options and see the outcome:
```javascript
composeTheme([{theme: iconStyle}, {theme: buttonStyle}]) =>
{
  'icon': 'x',
  'small': 'y',
  'medium': 'z'
  'button': 'a',
  'primary': 'b',
  'secondary': 'c',
  'icon-icon': 'd',
  'icon-small': 'e'
}
```
```javascript
composeTheme([{theme: iconStyle}, {theme: buttonStyle, prefix: 'icon-'}]) =>
{
  'icon': 'x d',
  'small': 'y e',
  'medium': 'z'
}
```
```javascript
composeTheme([{theme: iconStyle}, {theme: buttonStyle, prefix: 'icon-', compose: Compose.Assign}]) =>
{
  'icon': 'd',
  'small': 'e',
  'medium': 'z'
}
```
```javascript
composeTheme([{theme: iconStyle}, {theme: buttonStyle, prefix: 'icon-', compose: Compose.Replace}]) =>
{
  'icon': 'd',
  'small': 'e',
}
```
```javascript
composeTheme([{theme: iconStyle, compose: Compose.Replace}, {theme: buttonStyle, prefix: 'icon-'}]) =>
{
  'icon': 'd',
  'small': 'e',
}
```
```javascript
composeTheme([{theme: iconStyle, compose: Compose.Replace}, {theme: buttonStyle, prefix: 'icon-', compose: Compose.Assign}]) =>
{
  'icon': 'd',
  'small': 'e',
  'medium': 'z'
}
```

## React
Package that makes calling [composeTheme](#composeTheme-options) easier in React components, so you can just pass props/context to the methods below and they will map theme specific props with [composeTheme](#composeTheme-options) arguments.

* [npm](https://www.npmjs.com/package/@css-modules-theme/react): `npm install @css-modules-theme/react`
* [yarn](https://yarnpkg.com/en/package/@css-modules-theme/react): `yarn add @css-modules-theme/react`
* cdn: Exposed as `cssModulesThemeReact`
  * [Unpkg](https://unpkg.com/@css-modules-theme/react@2.1.2/dist/react.umd.js): `<script src="https://unpkg.com/@css-modules-theme/react@2.1.2/dist/react.umd.js"></script>`
  * [JSDelivr](https://cdn.jsdelivr.net/npm/@css-modules-theme/react@2.1.2/dist/react.umd.js): `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/react@2.1.2/dist/react.umd.js"></script>`

#### `composeThemeFromProps(ownTheme, propsOrContext, [options])`
As `import {composeThemeFromProps} from '@css-modules-theme/react'`;

*Parameters:*

 - `ownTheme` *(Object)* - First CSS modules object, used as an origin theme for composition
 - `propsOrContext` *(Object|Array)* - Standard react props object or array of props and context objects with the following properties:
   - [`theme`] *(Object)* - Maps to `theme` in `composeTheme`
   - [`themePrefix`] *(String)* - Maps to `prefix` in `composeTheme`
   - [`themeCompose`] *(String)* - Maps to `compose` in `composeTheme`
   - [`themeNoCache`] *(Boolean)* - Maps to `noCache` in `composeTheme`
   - [`themeNoParseComposes`] *(Boolean)* - Maps to `noParseComposes` in `composeTheme`
 - [`options`] *(Object)* - options for `ownTheme`
   - [`compose`] *(String)* - Default composition method for `composeTheme` if there is no `props.themeCompose` passed
   - [`prefix`] *(String)* - Goes directly to `composeTheme`
   - [`noCache = false`] *(Boolean)* - Default `noCache` flag if there is no `props.themeNoCache` passed.
   - [`noParseComposes = false`] *(Boolean)* - Default `noParseComposes` flag if there is no `props.themeNoParseComposes` passed.

### Examples
Assume we have a themeable Icon component. Default composition for it is `replace` declared in the render method of Icon component, but Button overrides it with `merge` declared as themeCompose='merge' in Button component. Button will use prefix `icon-` in own Button.css to concatenate the matching Icon classnames in Icon.css.
As a result of using `merge`, Button will render the bigger green Icon during the merge declaration by adding own classname to Icon's large selector definition.(e.g {large: "Icon_c Button_z"})
We can call `composeThemeFromProps` many times during the lifecycle of the component (we call it in `handleClick` sometime after `render`), result will always be taken from cache as long as `props.theme*` are the same
```css
/** Icon.css **/
.icon { width: 20px; }
.svg { color: red; }
.large { width: 30px; }
.small { width: 15px; }

/** Button.css **/
.button { width: 100px; }
.large { width: 200px; }
.small { width: 50px; }
.icon-svg { color: green; }
.icon-large { width: 40px; }
```
```javascript
import {composeThemeFromProps} from '@css-modules-theme/react';
import iconStyles from './Icon.css';
import buttonStyles from './Button.css';

class Icon extends Component {
  handleClick() {
     // We can call composeThemeFromProps(iconStyles, this.props) many times here, it will just return the same result from cache
    const theme = composeThemeFromProps(iconStyles, this.props);
    
    console.log(theme.icon)
  }
  
  render() {
    const theme = composeThemeFromProps(iconStyles, this.props, {compose: 'replace'});
    
    /* In case of call from Button final theme object would look like
    theme = {
      icon: "Icon_a",
      svg: "Icon_b Button_x",
      large: "Icon_c Button_z",
      small: "Icon_d",
    }
    */
        
    return <div className={theme.icon} onClick={this.handleClick}>{this.props.icon}</div>;
  }
}

class Button extends Component {  
  render() {    
    return (
      <button type="button">
        <Icon theme={buttonStyles} themePrefix="icon-" themeCompose="merge"/>
        {this.props.text}
      </button>
    );
  }
}
```

---
If we want to use composed `theme` in many lifecycle hooks or, for instance, in methods that can be called dozens of times quickly,
like in react-motion, we can manually check for changing theme props and compose a state `theme` in `getDerivedStateFromProps`.
By keeping theme in state, searching through the cache in hot functions can be avoided.
```javascript
import {composeThemeFromProps} from '@css-modules-theme/react';
import styles from './styles.css';

export default class extends Component {
  constructor(props) {
    super(props);
    
    this.state = {motionConfig: {...}};
    this.interpolateMotion = this.interpolateMotion.bind(this);
  }
  
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.theme !== prevState.injectTheme) {
      return {injectTheme: nextProps.theme, theme: composeThemeFromProps(styles, nextProps)};
    }
    
    return null;
  }
  
  interpolateMotion(config) {
    return (
      <div className={this.state.theme.text} style={{width: `${config.width}px`, height: `${config.height}px`}}>
        {this.props.content}
      </div>
    );
  }

  render() {
    return (
      <Motion style={this.state.motionConfig}>
        {this.interpolateMotion}
      </Motion>
    );
  }
}
```

#### `mixThemeWithProps`
As `import {mixThemeWithProps} from '@css-modules-theme/react'`;

What if your component just takes some properties from own `props` and pass all the rest down to another component as is. In that case you'd need to take all `theme*` props out, something like this:
```javascript
render() {
  let {size, onClick, theme, themePrefix, themeCompose, themeNoCache, ...elementProps} = this.props;
  
  theme = composeThemeFromProps(styles, this.props);
  elementProps.className = theme.main;
  
  ...
  
  return (
    <div {...elementProps}>
      ...
    </div>
  );
}
```
So you need to list all possible `theme*` props that parent can specify for `composeThemeFromProps`, to destructure them out because they are not valid for a child component. But what if `@css-modules-theme/react` will add more props in the future? It's pretty annoying to manually list them all.

For that case `mixThemeWithProps` has been created. It's a simple wrapper on top of `composeThemeFromProps` (and has exactly the same signature) that takes out all `theme*` props for you and mix composed `theme` in the result props object. So you can destructure only props you really need.
```javascript
render() {
  const {size, onClick, theme, ...elementProps} = mixThemeWithProps(styles, this.props);
  
  ...
  
  return (
    <div className={theme.main}>
      ...
    </div>
  );
}
```

## Other Libraries
Several projects emerged in the past few years, one of which is [react-css-themr](https://github.com/FriendsOfReactJS/react-css-themr). It focused on theming in React, but the way of merging themes from parent component into child is pretty generic and flexible. It solves the theming problem!  Unfortunately, it does it by wrapping all components with HOC without supporting forwardRef from the latest React.
Why "unfortunately"? We can implement a forwardRef support with a HOC but using HOC leads to significant performance degradation. Let's imagine we have a big React application with hundreds of basic components like Link, Button, Icon, Tag, Menu, Popup, etc... All of those components have their own css-module with styling, and each of them should be themeable. React is powerful because it gives us easy components composition. If you want Button or MenuItem be a link with href, you just make them render Link component in their render methods with passing theme so Link would look like Button or MenuItem. Many basic components might render Icon inside them and style (theme) that Icon differently. Now let's imagine you have a lot of content on a page, for instance Table with 50 rows and 10 columns (not big), and in each cell you have basic component that renders inside some content plus another basic component and so on. You end up with 500 cells that renders let's say ~2000 lightweight basic components. All of them are themeable, so each of them have HOC on top plus forwardRef, and now you have ~6000 components to render. You will start to cry while profiling rendering in Performance tab of DevTools noticing that the first render of your page takes hundreds of milliseconds.

But let's step back and think for a second. What does HOC do? It creates component instance for each wrapped instance of your component and merge your style object with theme object from a parent component instance. If we have 2000 identical components with different content, it will do it 2000 times. Hm, that doesn't sound right, because result theme object will be essentially the same for all of them. The nature of HOC multiplies isolated instances of your components by 2-3 times.

What if we could generate result theme for given two themes only once and then just reuse it in all similar components?
And with `css-modules-theme` we can and we get it automatically.

## Bundling

Modules under @css-modules-theme namespace are built with [rollup](https://github.com/rollup/rollup) and distributed through package managers ([npm](https://www.npmjs.com/settings/css-modules-theme/packages), [yarn](https://yarnpkg.com/en/package/@css-modules-theme/react), cdn's) with `dist/` folder that contains several bundles for different targets:
* dist/[*name*].umd.js - Universal minified module, transpiled down to ES5 code, and can be fetched and used by any browser or nodejs as is, available on cdns 
* dist/[*name*].cjs.js - classic CommonJS bundle transpiled down to ES5 code
* dist/[*name*].es.js - ES6-module bundle transpiled down to ES5 code
* dist/[*name*].es2015.js - ES6-module bundle transpiled down to ES6 (2015) code, where, for instance, object rest/spread is transpiled to Object.assign
* dist/[*name*].es2018.js - ES6-module bundle transpiled down to ES9 (2018) code, which basicall means no transpilation at the moment

Each of them has corresponding field in `package.json`:
```json
  "browser": "dist/name.umd.js",
  "main": "dist/name.cjs.js",
  "module": "dist/name.es.js",
  "es2015": "dist/name.es2015.js",
  "es2018": "dist/name.es2018.js",
```

If you write simple website, support variety of browsers and prefer to insert script tags to the html head, then you can embed desired module like that: `<script src="https://unpkg.com/@css-modules-theme/react@@2.1.2/dist/react.umd.js"></script>`.

But if you, more likely, use bundlers to build your applications, like [webpack](https://github.com/webpack/webpack), then better choice would be to require corresponding module for a target that you need. If you compile your app bundle down to ES5, then webpack config can look like that
```javascript
...
resolve: {
  mainFields: ['module', 'browser', 'main'],
  ...
}
```
so webpack will search for existence of ES module first for better bundling.

If you compile for modern browsers that [support](http://kangax.github.io/compat-table/es2016plus/) ES2015+ you can specify:
```javascript
mainFields: ['es2015', 'module', 'browser', 'main'],
````
or if latest browsers:
```javascript
mainFields: ['es2018', 'es2017', 'es2016', 'es2015', 'module', 'browser', 'main'],
````
You get the idea. You can compile your application into several bundles with different compilation levels and have different webpack configs for them with different set of `mainFields`, to give to the modern browsers almost pure non compiled code, that takes less space and have fewer transformations, which leads to better performance.

## Contribution

You are always welcome to: create github issues, make fixes or improvements in code, types, tests.
Clone project and run `npm install && npm run bootstrap` to start working.
If you using IDE, like WebStorm, add `--build` option to the typescript setup.