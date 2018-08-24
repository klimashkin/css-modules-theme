[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

# CSS MODULES THEME

- [Motivation](#theme-composition-for-css-modules)
- [@css-modules-theme/core](#css-modules-themecore)
  * [getTheme](#getthemeowntheme-injecttheme-options)
- [@css-modules-theme/react](#css-modules-themereact)
  * [getThemeFromProps](#getthemefrompropsowntheme-props-options)

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

* npm: `npm install @css-modules-theme/core`
* yarn: `yarn add @css-modules-theme/core`
* cdn: Exposed as `cssModulesThemeCore`
  * Unpkg: `<script src="https://unpkg.com/@css-modules-theme/core@1.1.0/dist/core.umd.js"></script>`
  * JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/core@1.1.0/dist/core.umd.js"></script>`

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

* npm: `npm install @css-modules-theme/react`
* yarn: `yarn add @css-modules-theme/react`
* cdn: Exposed as `cssModulesThemeReact`
  * Unpkg: `<script src="https://unpkg.com/@css-modules-theme/react@1.1.0/dist/react.umd.js"></script>`
  * JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@css-modules-theme/react@1.1.0/dist/react.umd.js"></script>`

620bytes module that makes call of `getTheme` easier in React components, so you can just pass props to the following method and it will map theme specific props with getTheme arguments.

### `getThemeFromProps(ownTheme, props, [options])`

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
Assume we have themeable Icon component. We can call `getThemeFromProps` many times during the lifecycle of the component, result will always be taken from cache as long as `props.theme*` are the same
```javascript
import {getThemeFromProps} from '@css-modules-theme/react';
import styles from './Icon.css';

class Icon extends Component {
  handleClick() {
     // We can call getThemeFromProps(styles, this.props) many times here, it will just return the same result from cache
    const theme = getThemeFromProps(styles, this.props);
    
    console.log(theme.icon)
  }
  
  render() {
    const theme = getThemeFromProps(styles, this.props);
    
    return <div className={theme.icon} onClick={this.handleClick}>{this.props.icon}</div>;
  }
}
```
Or we can manually check for changing `theme` in props and compose in getDerivedStateFromProps
```javascript
import {getThemeFromProps} from '@css-modules-theme/react';
import styles from './Icon.css';

class Icon extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.theme !== prevState.injectTheme) {
      return {injectTheme: nextProps.theme, theme: getThemeFromProps(styles, nextProps)};
    }
    
    return null;
  }
  
  handleClick() {
    console.log(this.state.theme.icon)
  }
  
  render() {
    return <div className={this.state.theme.icon} onClick={this.handleClick}>{this.props.icon}</div>;
  }
}
```

# LICENCE
[MIT](https://github.com/klimashkin/css-modules-theme/blob/master/LICENSE)