// Type definitions for CSS Modules Theme

// Project: https://github.com/klimashkin/css-modules-theme/
// Definitions by: shiro <https://github.com/shiro>
// Definitions: https://github.com/klimashkin/css-modules-theme
// TypeScript Version: 2.8


/**
 * @example interface IProps extends IThemeProps<typeof styles>
 */
export interface ThemeProps<T = {}> {
    theme?: Theme<T>;
    themePrefix?: string;
    themeCompose?: ThemeComposeMode;
    themeNoCache?: boolean;
    options?: ThemeOptions;
}

export interface ThemeOptions {
    compose?: ThemeComposeMode;
    ownPrefix?: string;
    noCache?: boolean;
}

export type ThemeComposeMode = 'merge' | 'assign' | 'replace';

export type Theme<T = {}> = Partial<T> & {
    [prop: string]: string;
}

/**
 * @param ownTheme  First CSS modules object, used as a default (origin) theme for composition
 * @param props     Standard react props object containing theming properties
 * @param options   Additional options
 *
 * @return theme
 */
export function getThemeFromProps<T>(ownTheme: Theme<T>, props: ThemeProps, options?: ThemeOptions): Theme<T>;

/**
 * @param ownTheme             First CSS modules object, used as a default (origin) theme for composition
 * @param props                Standard react props object with following properties:
 * @param options              Additional options
 *
 * @return props & boxed theme
 */
export function mixThemeWithProps<T, U extends ThemeProps>(ownTheme: Theme<T>, props: U, options?: ThemeOptions):
    { theme: Theme<T> } & Pick<U, Exclude<keyof U, keyof ThemeProps>>
