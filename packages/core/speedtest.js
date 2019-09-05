/**
 * Run this using 'node -r esm ./packages/core/speedtest.js'
 */
import {composeTheme} from './dist/core.es2019';

const themeIcon = {
  icon: 'Icon_icon',
  small: 'Icon_small Icon_icon',
  medium: 'Icon_medium Icon_icon',
  svg: 'Icon_svg',
};
const themeButton = {
  button: 'Button_button',
  primary: 'Button_primary Button_button',
  secondary: 'Button_secondary Button_button',
  text: 'Button_text',
  color: 'Button_color',
  size: 'Button_size',
  'success-icon': 'Button_success-icon Button_color',
  'success-svg': 'Button_success-svg Button_size',
};
let start;
let i;

for (start = Date.now(), i = 0; i < 1e6; i++) {
  composeTheme([{theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'success-'}]);
}

console.log(`1 million compositions no Cache   have been done in ${Date.now() - start}ms`);

for (start = Date.now(), i = 0; i < 1e6; i++) {
  composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-'}]);
}

console.log(`1 million compositions with Cache have been done in ${Date.now() - start}ms`);
