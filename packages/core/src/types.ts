export enum Compose {Merge = 'merge', Assign = 'assign', Replace = 'replace'}
export type Prefix = string;

export type Theme = {
  [prop: string]: string;
};
export type ThemeOptions = {
  theme: Theme,
  prefix?: Prefix,
  compose?: Compose,
  noCache?: boolean,
};
export type ComposedThemesCacheItem = {
  prefix?: Prefix,
  againstTheme: Theme,
  composedTheme: Theme,
  composeMethod: Compose,
};
export type ComposedThemesCacheItems = Array<ComposedThemesCacheItem>;
export type ComposedThemesCacheMap = WeakMap<Theme, ComposedThemesCacheItems>;

export type PrefixedThemesCacheItem = {
  theme: Theme,
  prefix: Prefix,
  finalTheme: Theme,
};
export type PrefixedThemesCacheItems = Array<PrefixedThemesCacheItem>;
export type PrefixedThemesCacheMap = WeakMap<Theme, PrefixedThemesCacheItems>;