import {Compose, composeTheme, getCachedThemeCompositionDependencies} from './index';
import * as types from './types';

describe('Single theme', () => {
  const themeIcon: types.Theme = {
    icon: 'Icon_icon',
    svg: 'Icon_svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  };
  const themeButton: types.Theme = {
    button: 'Button_button',
    primary: 'Button_primary Button_button',
    secondary: 'Button_secondary Button_button',
    text: 'Button_text',
    icon: 'Button_icon',
    'firstIcon-icon': 'Button_firstIcon-icon',
    'firstIcon-svg': 'Button_firstIcon-svg',
    'lastIcon-icon': 'Button_lastIcon-icon',
    'lastIcon-svg': 'Button_lastIcon-svg',
  };

  it.each([
    {theme: themeIcon},
    {theme: themeIcon, noCache: true},
    {theme: themeIcon, compose: Compose.Merge},
    {theme: themeIcon, compose: Compose.Assign},
    {theme: themeIcon, compose: Compose.Replace},
  ])(
    'should return passed theme as is from %p',
    params => {
      expect(composeTheme([params])).toStrictEqual(themeIcon);
    }
  );

  it('should return theme filtered by prefix', () => {
    expect(composeTheme([{theme: themeButton, prefix: 'firstIcon-'}])).toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    });
  });

  it('should return the same filtered by prefix theme from cache after multiple calls', () => {
    const filteredTheme = composeTheme([{theme: themeButton, prefix: 'lastIcon-'}]);

    expect(filteredTheme).toStrictEqual({
      icon: 'Button_lastIcon-icon',
      svg: 'Button_lastIcon-svg',
    });

    // Filtering of the first theme should be insensitive to noCache, cache is always true
    expect(composeTheme([{theme: themeButton, prefix: 'lastIcon-', noCache: false}])).toBe(filteredTheme);
    expect(composeTheme([{theme: themeButton, prefix: 'lastIcon-', noCache: true}])).toBe(filteredTheme);
  });
});


describe('Two themes', () => {
  const themeIcon: types.Theme = {
    icon: 'Icon_icon',
    svg: 'Icon_svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  };
  const themeButton: types.Theme = {
    button: 'Button_button',
    primary: 'Button_primary Button_button',
    secondary: 'Button_secondary Button_button',
    text: 'Button_text',
    icon: 'Button_icon',
    'firstIcon-icon': 'Button_firstIcon-icon',
    'firstIcon-svg': 'Button_firstIcon-svg',
    'lastIcon-icon': 'Button_lastIcon-icon',
    'lastIcon-svg': 'Button_lastIcon-svg',
  };

  it.each([
    [{theme: {...themeIcon}}, {theme: {...themeButton}}],
    [{theme: {...themeIcon}, compose: Compose.Merge}, {theme: {...themeButton}}],
    [{theme: {...themeIcon}, compose: Compose.Merge}, {theme: {...themeButton}, compose: Compose.Merge}],
    [{theme: {...themeIcon}, compose: Compose.Assign}, {theme: {...themeButton}, compose: Compose.Merge}],
    [{theme: {...themeIcon}, compose: Compose.Replace}, {theme: {...themeButton}, compose: Compose.Merge}],
    [{theme: {...themeIcon}}, {theme: {...themeButton}, compose: Compose.Merge}],
  ])(
    'should compose by merge [%p, %p]',
    (a, b) => {
      let theme: types.Theme;
      const expectedResult: types.Theme = {
        icon: 'Icon_icon Button_icon',
        svg: 'Icon_svg',
        small: 'Icon_small',
        medium: 'Icon_medium',
        large: 'Icon_large',
        button: 'Button_button',
        primary: 'Button_primary Button_button',
        secondary: 'Button_secondary Button_button',
        text: 'Button_text',
        'firstIcon-icon': 'Button_firstIcon-icon',
        'firstIcon-svg': 'Button_firstIcon-svg',
        'lastIcon-icon': 'Button_lastIcon-icon',
        'lastIcon-svg': 'Button_lastIcon-svg',
      };

      // First and second call should return the same object, because default noCache is false
      {
        theme = composeTheme([a, b]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([a, b])).toBe(theme);
      }

      // But second call with noCache should return a new object
      {
        theme = composeTheme([{...a, noCache: true}, {...b}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a, noCache: true}, {...b}])).not.toBe(theme);

        theme = composeTheme([{...a}, {...b, noCache: true}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a}, {...b, noCache: true}])).not.toBe(theme);
      }
    }
  );

  it('should filter and compose by merge', () => {
    let theme: types.Theme;
    const expectedResult: types.Theme = {
      icon: 'Icon_icon Button_firstIcon-icon',
      svg: 'Icon_svg Button_firstIcon-svg',
      small: 'Icon_small',
      medium: 'Icon_medium',
      large: 'Icon_large',
    };

    // First and second call should return the same object, because default noCache is false
    {
      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-'}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-'}])).toBe(theme);
    }

    // But second call with noCache should return a new object
    {
      theme = composeTheme([{theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-'}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-'}])).not.toBe(theme);

      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', noCache: true}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', noCache: true}])).not.toBe(theme);
    }
  });


  it.each([
    [{theme: {...themeIcon}, compose: Compose.Assign}, {theme: {...themeButton}}],
    [{theme: {...themeIcon}, compose: Compose.Assign}, {theme: {...themeButton}, compose: Compose.Assign}],
    [{theme: {...themeIcon}, compose: Compose.Merge}, {theme: {...themeButton}, compose: Compose.Assign}],
    [{theme: {...themeIcon}, compose: Compose.Replace}, {theme: {...themeButton}, compose: Compose.Assign}],
    [{theme: {...themeIcon}}, {theme: {...themeButton}, compose: Compose.Assign}],
  ])(
    'should compose by assign [%p, %p]',
    (a, b) => {
      let theme: types.Theme;
      const expectedResult: types.Theme = {
        icon: 'Button_icon',
        svg: 'Icon_svg',
        small: 'Icon_small',
        medium: 'Icon_medium',
        large: 'Icon_large',
        button: 'Button_button',
        primary: 'Button_primary Button_button',
        secondary: 'Button_secondary Button_button',
        text: 'Button_text',
        'firstIcon-icon': 'Button_firstIcon-icon',
        'firstIcon-svg': 'Button_firstIcon-svg',
        'lastIcon-icon': 'Button_lastIcon-icon',
        'lastIcon-svg': 'Button_lastIcon-svg',
      };

      // First and second call should return the same object, because default noCache is false
      {
        theme = composeTheme([a, b]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([a, b])).toBe(theme);
      }

      // But second call with noCache should return a new object
      {
        theme = composeTheme([{...a, noCache: true}, {...b}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a, noCache: true}, {...b}])).not.toBe(theme);

        theme = composeTheme([{...a}, {...b, noCache: true}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a}, {...b, noCache: true}])).not.toBe(theme);
      }
    }
  );

  it('should filter and compose by assign', () => {
    let theme: types.Theme;
    const expectedResult: types.Theme = {
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
      small: 'Icon_small',
      medium: 'Icon_medium',
      large: 'Icon_large',
    };

    // First and second call should return the same object, because default noCache is false
    {
      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign}])).toBe(theme);
    }

    // But second call with noCache should return a new object
    {
      theme = composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign},
      ])).not.toBe(theme);

      theme = composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign, noCache: true},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Assign, noCache: true},
      ])).not.toBe(theme);
    }
  });


  it.each([
    [{theme: {...themeIcon}, compose: Compose.Replace}, {theme: themeButton}],
    [{theme: {...themeIcon}, compose: Compose.Replace}, {theme: themeButton, compose: Compose.Replace}],
    [{theme: {...themeIcon}, compose: Compose.Merge}, {theme: themeButton, compose: Compose.Replace}],
    [{theme: {...themeIcon}, compose: Compose.Assign}, {theme: themeButton, compose: Compose.Replace}],
    [{theme: {...themeIcon}}, {theme: themeButton, compose: Compose.Replace}],
  ])(
    'should compose by replace [%p, %p]',
    (...args: types.ThemeOptions[]) => {
      expect(composeTheme(args)).toBe(themeButton);
    }
  );

  it('should filter and compose by replace', () => {
    let theme;
    const expectedResult = {
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    };

    // First and second call should return the same object, because default noCache is false
    {
      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace}])).toBe(theme);
    }

    // But second call with noCache should return a new object only if noCache is set on second theme
    {
      theme = composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace},
      ])).toBe(theme);

      theme = composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace, noCache: true},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: Compose.Replace, noCache: true},
      ])).not.toBe(theme);
    }
  });
});


describe('With composition', () => {
  it('should not return dependencies since there is not composition', () => {
    expect(getCachedThemeCompositionDependencies({
      one: 'a',
      two: 'ab',
      three: 'c',
      four: 'd',
      five: 'e',
    })).toBeUndefined();
  });

  /**
   * .one {...} // .a
   * .two {composes: one; ...} // .ab
   * .three {composes: one; ...} // .c
   * .four {composes: two; ...} // .d
   * .five {composes: three; ...} // .e
   */
  const theme: types.Theme = {
    one: 'a',
    two: 'ab a',
    three: 'c a',
    four: 'd ab a',
    five: 'e c a',
  };

  it('should return dependencies', () => {
    const dependencies = getCachedThemeCompositionDependencies(theme);

    expect(typeof dependencies === 'object' && dependencies.prototype).toBeUndefined();
    expect(dependencies).toEqual({
      one: ['two', 'three', 'four', 'five'],
      two: ['four'],
      three: ['five'],
    });
  });

  it('should return dependencies from cache on consequent calls', () => {
    expect(getCachedThemeCompositionDependencies(theme)).toBe(getCachedThemeCompositionDependencies(theme));
  });

  /**
   * .icon {...} // .Icon_icon
   * .iconSmall {composes: icon; ...} // .Icon_iconSmall
   * .iconMedium {composes: icon; ...} // .Icon_iconMedium
   * .iconSvg {...} // .Icon_iconSvg
   */
  const themeIcon: types.Theme = {
    icon: 'Icon_icon',
    iconSmall: 'Icon_iconSmall Icon_icon',
    iconMedium: 'Icon_iconMedium Icon_icon',
    iconSvg: 'Icon_iconSvg',
  };

  /**
   * .button {...} // .Button_button
   * .primary {composes: button; ...} // .Button_primary
   * .secondary {composes: button; ...} // .Button_secondary
   * .text {...} // .Button_text
   * .color {...} // .Button_color
   * .size {...} // .Button_size
   * .success-icon {composes: color; ...} // .Button_success-icon
   * .success-iconSvg {composes: size; ...} // .Button_success-iconSvg
   */
  const themeButton: types.Theme = {
    button: 'Button_button',
    primary: 'Button_primary Button_button',
    secondary: 'Button_secondary Button_button',
    text: 'Button_text',
    color: 'Button_color',
    size: 'Button_size',
    'success-icon': 'Button_success-icon Button_color',
    'success-iconSvg': 'Button_success-iconSvg Button_size',
  };

  it('should return theme composed of two without taking care of composes', () => {
    expect(composeTheme([{theme: themeIcon, noParseComposes: true}, {theme: themeButton, prefix: 'success-'}])).toStrictEqual({
      icon: 'Icon_icon Button_success-icon Button_color',
      iconSmall: 'Icon_iconSmall Icon_icon',
      iconMedium: 'Icon_iconMedium Icon_icon',
      iconSvg: 'Icon_iconSvg Button_success-iconSvg Button_size',
    });
    expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-', noParseComposes: true}])).toStrictEqual({
      icon: 'Icon_icon Button_success-icon Button_color',
      iconSmall: 'Icon_iconSmall Icon_icon',
      iconMedium: 'Icon_iconMedium Icon_icon',
      iconSvg: 'Icon_iconSvg Button_success-iconSvg Button_size',
    });
  });

  it('should return theme composed of two', () => {
    const theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-'}]);

    expect(theme).toStrictEqual({
      icon: 'Icon_icon Button_success-icon Button_color',
      iconSmall: 'Icon_iconSmall Icon_icon Button_success-icon Button_color',
      iconMedium: 'Icon_iconMedium Icon_icon Button_success-icon Button_color',
      iconSvg: 'Icon_iconSvg Button_success-iconSvg Button_size',
    });
    expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-'}])).toBe(theme);
  });


  it('should return theme composed of two with assign', () => {
    const theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-', compose: Compose.Assign}]);

    expect(theme).toStrictEqual({
      icon: 'Button_success-icon Button_color',
      iconSmall: 'Icon_iconSmall Button_success-icon Button_color',
      iconMedium: 'Icon_iconMedium Button_success-icon Button_color',
      iconSvg: 'Button_success-iconSvg Button_size',
    });
    expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'success-', compose: Compose.Assign}])).toBe(theme);
  });
});
