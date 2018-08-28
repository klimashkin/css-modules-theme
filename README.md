[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

# CSS MODULES THEME

- [Motivation](#theme-composition-for-css-modules)
- [@css-modules-theme/core](#css-modules-themecore)
  * [getTheme](#getthemeowntheme-injecttheme-options)
- [@css-modules-theme/react](#css-modules-themereact)
  * [getThemeFromProps](#getthemefrompropsowntheme-props-options)
  * [mixThemeWithProps](#mixthemewithprops)
- [Bundling](#bundling)

# Theme composition for CSS Modules  
  
CSS Modules give you a very powerful way to write statically compiled, locally scoped and composable css selectors.
Local scope is the corner stone of CSS Modules, it finally solves clashes of css selectors by generating unique class names on compilation time. Therefore, CSS Modules becomes a natural choice in the world of componentized front-end development, like in React.

Local scope brings a challenge: how to style children component from parent if they are isolated and their final selector names are unknown during development process?
Theming is the answer.
  
Let's recap on what is CSS Module. On one side it’s just a standard css file, on JS side it’s an object that maps real (generated) class names from that file with names you give them during development.
For instance, imagine you have the following css code:
```css  
.button {  
  display: inline-block;
}  
.primary {  
  background-clor: green;  
}  
.secondary {  
  background-clor: red;  
}  
```  
From the above css definition, depending on css-loader setting (when using a module bundler like 'webpack'), we might get generated css like this: 
```css  
.aa {  
  display: inline-block;
}  
.ab {  
  background-clor: green;  
}  
.ac {  
  background-clor: red;  
}  
```
And in JavaSctipt you get the following object:  
```javascript  
{ 
  button: 'aa',
  primary: 'ab',
  secondary: 'ac',
}
```

How will a page that uses Button component modify its primary styling if it doesn't know aa classname? With React, we can create a boolean prop in a Button component for each possible style modification. Adding extra prop(s) for css logic can be managable for simple components. As the complexity grows, a component's prop definitions can grow exponentially making prop management difficult.

The solution to avoid overwhelming a component with boolean props is to take two css-module objects and merge them together to get a final object. The first object can be called original theme, or ownTheme of the component, and the second one can be called injectTheme since we mix it into the first one. Both 'ownTheme' and 'injectTheme' can be synonymous to parent: injectTheme, child: ownTheme. 

Several projects emerged in the past few years, one of which is [react-css-themr](https://github.com/javivelasco/react-css-themr). It focused on theming in React, but the way of merging themes from parent component into child is pretty generic and flexible. It solves the theming problem!  Unfortunately, it does it by wrapping all components with HOC without supporting forwardRef from the latest React.
Why "unfortunately"? We can implement a forwardRef support with a HOC but using HOC leads to significant performance degradation. Let's imagine we have a big React application with hundreds of basic components like Link, Button, Icon, Tag, Menu, Popup, etc... All of those components have their own css-module with styling, and each of them should be themeable. React is powerful because it gives us easy components composition. If you want Button or MenuItem be a link with href, you just make them render Link component in their render methods with passing theme so Link would look like Button or MenuItem. Many basic components might render Icon inside them and style (theme) that Icon differently. Now let's imagine you have a lot of content on a page, for instance Table with 50 rows and 10 columns (not big), and in each cell you have basic component that renders inside some content plus another basic component and so on. You end up with 500 cells that renders let's say ~2000 lightweight basic components. All of them are themeable, so each of them have HOC on top plus forwardRef, and now you have ~6000 components to render. You will start to cry while profiling rendering in Performance tab with DevTools by noticing the first render of your page takes hundreds of milliseconds.

But let's step back and think for a second. What does HOC do? It creates component instance for each wrapped instance of your component and merge your style object with theme object from a parent component instance. If we have 2000 identical components with different content, it will do it 2000 times. Hm, that doesn't sound right, because result theme object will be essentially the same for all of them. The nature of HOC multiplies isolated instances of your components by 2-3 times.

What if we could generate result theme for a given ownTheme and injectTheme only once and then just reuse it in all similar components?
And now we can.

**@css-modules-theme** is a project based on two simple ideas:

* First, themes composition must be fast. That means, no spawning class instance on each composition, no fancy multistep map/reduces or third-party helpers, just a few straightforward classic JS loops with minimum transformations. 

* Second, result of that composition should be weakly cached for given parameters and shared between different calls. If we render component that renders another themeable component many times, in vast majority of cases parent component will pass the same theme object to the child, thus result theme can be composed only once, cached and reused by other components from that cache.
To achieve that @css-modules-theme puts injectTheme as a key into WeakMap (to free up memory when injectTheme is not needed anymore) and composed theme along with options into value of that map. 
So when you call getTheme for the first time, it will do the composition and put the result into cache, and all consequent calls with the same arguments will just return the same result from that cache.
From the table example mentioned above, the new table implementation with **css-modules-theme** was able to reduce the number of compositions from 761 to 42 and total page rendering time (with all content) by **30%**.

Project includes two (for now) scoped packages: [@css-modules-theme/core](https://github.com/klimashkin/css-modules-theme/tree/master/packages/core) and [@css-modules-theme/react](https://github.com/klimashkin/css-modules-theme/tree/master/packages/react)

## @css-modules-theme/core

* [npm](https://www.npmjs.com/package/@css-modules-theme/core): `npm install @css-modules-theme/core`
* [yarn](https://yarnpkg.com/en/package/@css-modules-theme/core): `yarn add @css-modules-theme/core`
* cdn: Exposed as `cssModulesThemeCore`
  * [Unpkg](https://unpkg.com/@css-modules-theme/core@1.1.0/dist/core.umd.js): `<script src="https://unpkg.com/@css-modules-theme/core@1.1.0/dist/core.umd.js"></script>`
  * [JSDelivr](https://cdn.jsdelivr.net/npm/@css-modules-theme/core@1.1.0/dist/core.umd.js): `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/core@1.1.0/dist/core.umd.js"></script>`

1.5kb module (890bytes gzip) that represents pretty simple singleton which creates WeakMap for caching composed themes and exposes the following method

### `getTheme(ownTheme, [injectTheme], [options])`
Function that returns a new theme as a result of composition of two given themes. Takes following arguments

 - `ownTheme` *(Object)* - First CSS modules object, used as a default (origin) theme for composition
 - [`injectTheme`] *(Object)* - Second CSS modules object, that is merged into the `ownTheme`. If omitted `getTheme` simply returns `ownTheme`
 - [`options`] *(Object)*
   - [`compose = 'merge'`] *(String)* - Composition method
	   - `'merge'` Default way that assigns classnames from injectTheme to ownTheme, and concatenate classnames if exists in both
	   - `'assign'` Also assign classnames from injectTheme to ownTheme, like Object.assign, so if classname exists in both, injectTheme takes precedence
	   - `'replace'` Just use injectTheme
   - [`ownPrefix`] *(String)* - Prefix to filter and strip out properties in `ownTheme` that don't satisfy that prefix
   - [`injectPrefix`] *(String)* - Prefix to filter and strip out properties in `injectPrefix` that don't satisfy that prefix
   - [`noCache = false`] *(Boolean)* - In case you generate pretty big `injectTheme` dynamically (for instance, on each render), there is no reason to cache result, since there might be too many variation of outcome. In that case you can set `noCache` to `true` to skip putting result into cache and looking it up.

### Examples
Assume we have Icon component with following theme:
```javascript
const ownTheme = {
  'icon': 'x',
  'small': 'y',
  'medium': 'z'
}
```
and Button component which wants to render Icon component and pass following theme to it:
```javascript
const injectTheme = {
  'button': 'a',
  'primary': 'b',
  'secondary': 'c',
  'icon-icon': 'd',
  'icon-small': 'e'
}
```
Now let's compose them with different options and see the outcome:
```javascript
getTheme(ownTheme, injectTheme) =>
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
getTheme(ownTheme, injectTheme, {injectPrefix: 'icon-') =>
{
  'icon': 'x d',
  'small': 'y e',
  'medium': 'z'
}
```
```javascript
getTheme(ownTheme, injectTheme, {injectPrefix: 'icon-', compose: 'assign'}) =>
{
  'icon': 'd',
  'small': 'e',
  'medium': 'z'
}
```
```javascript
getTheme(ownTheme, injectTheme, {injectPrefix: 'icon-', compose: 'replace'}) =>
{
  'icon': 'd',
  'small': 'e',
}
```
```javascript
getTheme(ownTheme, injectTheme, {injectPrefix: 'icon-', compose: 'replace'}) =>
{
  'icon': 'd',
  'small': 'e',
}
```

## @css-modules-theme/react

* [npm](https://www.npmjs.com/package/@css-modules-theme/react): `npm install @css-modules-theme/react`
* [yarn](https://yarnpkg.com/en/package/@css-modules-theme/react): `yarn add @css-modules-theme/react`
* cdn: Exposed as `cssModulesThemeReact`
  * [Unpkg](https://unpkg.com/@css-modules-theme/react@1.2.0/dist/react.umd.js): `<script src="https://unpkg.com/@css-modules-theme/react@1.2.0/dist/react.umd.js"></script>`
  * [JSDelivr](https://cdn.jsdelivr.net/npm/@css-modules-theme/react@1.2.0/dist/react.umd.js): `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/react@1.2.0/dist/react.umd.js"></script>`


### `getThemeFromProps(ownTheme, props, [options])`

Helper module that makes call of `getTheme` easier in React components, so you can just pass props to this method and it will map theme specific props with getTheme arguments.

*Parameters:*

 - `ownTheme` *(Object)* - First CSS modules object, used as a default (origin) theme for composition
 - `props` - Standard react props object with following properties:
   - [`theme`] *(Object)* - Maps to `injectTheme` in `getTheme`
   - [`themePrefix`] *(String)* - Maps to `injectPrefix` in `getTheme`
   - [`themeCompose`] *(String)* - Maps to `compose` in `getTheme`
   - [`themeNoCache`] *(Boolean)* - Maps to `noCache` in `getTheme`
 - [`options`] *(Object)*
   - [`compose`] *(String)* - Default composition method for `getTheme` if there is no `props.themeCompose` passed
   - [`ownPrefix`] *(String)* - Goes directly to `getTheme`
   - [`noCache = false`] *(Boolean)* - Default `noCache` flag if there is no `props.themeNoCache` passed.

### Examples
Assume we have a themeable Icon component. Default composition for it is `'replace'`, but Button overrides it with `'merge'` one. Also, Button picks for Icon only classnames from its own style with prefix `icon-`. In result Button will render bigger green Icon.

We can call `getThemeFromProps` many times during the lifecycle of the component (we call it in `handleClick` sometime after `render`), result will always be taken from cache as long as `props.theme*` are the same
```css
/** iconStyles.css **/
.icon { width: 20px; }
.svg { color: red }
.large { width: 30px; }
.small { width: 15px; }

/** buttonStyles.css **/
.button { width: 100px; }
.large { width: 200px; }
.small { width: 50px; }
.icon-svg { color: green; }
.icon-large { width: 40px; }
```
```javascript
import {getThemeFromProps} from '@css-modules-theme/react';
import iconStyles from './Icon.css';
import buttonStyles from './Button.css';

class Icon extends Component {
  handleClick() {
     // We can call getThemeFromProps(iconStyles, this.props) many times here, it will just return the same result from cache
    const theme = getThemeFromProps(iconStyles, this.props);
    
    console.log(theme.icon)
  }
  
  render() {
    const theme = getThemeFromProps(iconStyles, this.props, {compose: 'replace'});
    
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
If we want to use composed `theme` in many lifecycle hooks or, for instance, in methods that can be called dozens of times in short period of time, like in react-motion, we can manually check for changing `theme` props and compose final theme in `getDerivedStateFromProps`. To avoid even looking theme up in cache in hot functions.
```javascript
import {getThemeFromProps} from '@css-modules-theme/react';
import styles from './styles.css';

export default class extends Component {
  constructor(props) {
    super(props);
    
    this.state = {motionConfig: {...}};
    this.interpolateMotion = this.interpolateMotion.bind(this);
  }
  
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.theme !== prevState.injectTheme) {
      return {injectTheme: nextProps.theme, theme: getThemeFromProps(styles, nextProps)};
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

### `mixThemeWithProps`

What if your component just takes some properties from own `props` and pass all the rest down to another component as is. In that case you'd need to take all `theme*` props out, something like that:
```javascript
render() {
  let {size, onClick, theme, themePrefix, themeCompose, themeNoCache, ...elementProps} = this.props;
  
  theme = getThemeFromProps(styles, this.props);
  elementProps.className = theme.main;
  
  ...
  
  return (
    <div {...elementProps}>
      ...
    </div>
  );
}
```
So you need to list all possible `theme*` props that parent can specify for `getThemeFromProps`, to destructure them out because they are not valid for a child component. But what if `@css-modules-theme/react` will add more props in the future? It's pretty annoying to manually list them all.

For that case `mixThemeWithProps` has been created. It's a simple wrapper on top of `getThemeFromProps` (and has exactly the same signature) that takes out all `theme*` props for you and mix composed `theme` in the result props object. So you can destructure only props you really need.
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

If you write simple website, support variety of browsers and prefer to insert script tags to the html head, then you can embed desired module like that: `<script src="https://unpkg.com/@css-modules-theme/react@1.2.0/dist/react.umd.js"></script>`.

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

## LICENCE
[MIT](https://github.com/klimashkin/css-modules-theme/blob/master/LICENSE)