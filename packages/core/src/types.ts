export type Semipartial<A, K extends keyof A> = Partial<A> & Pick<A, K>;

export enum Compose {Merge = 'merge', Assign = 'assign', Replace = 'replace'}

export type Prefix = string;

export interface Theme {
  [key: string]: string;
}
export interface ThemeOptions {
  theme: Theme;
  prefix?: Prefix;
  compose?: Compose;
  noCache?: boolean;
  noParseComposes?: boolean;
}
export interface ComposedThemesCacheItem {
  prefix?: Prefix;
  againstTheme: Theme;
  composedTheme: Theme;
  composeMethod: Compose;
  parseComposes: boolean;
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

export interface ThemeDependencies {[key: string]: [string]}
export type ThemeDependenciesCacheMap = WeakMap<Theme, ThemeDependencies>;
