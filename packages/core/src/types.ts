export enum Compose {Merge = 'merge', Assign = 'assign', Replace = 'replace'} // eslint-disable-line no-unused-vars
export type Prefix = string;

export interface Theme {
  [prop: string]: string;
}
export interface ThemeOptions {
  theme: Theme;
  prefix?: Prefix;
  compose?: Compose;
  noCache?: boolean;
}
export interface ComposedThemesCacheItem {
  prefix?: Prefix;
  againstTheme: Theme;
  composedTheme: Theme;
  composeMethod: Compose;
}
export type ComposedThemesCacheItems = ComposedThemesCacheItem[];
export type ComposedThemesCacheMap = WeakMap<Theme, ComposedThemesCacheItems>;

export interface PrefixedThemesCacheItem {
  theme: Theme;
  prefix: Prefix;
  finalTheme: Theme;
}
export type PrefixedThemesCacheItems = PrefixedThemesCacheItem[];
export type PrefixedThemesCacheMap = WeakMap<Theme, PrefixedThemesCacheItems>;
