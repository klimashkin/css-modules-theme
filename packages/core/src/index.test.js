import {composeTheme, COMPOSE_MERGE, COMPOSE_ASSIGN, COMPOSE_REPLACE} from './index';

describe('Single theme', () => {
  const themeIcon = {
    icon: 'Icon_icon',
    svg: 'Icon_svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  };
  const themeButton = {
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
    {theme: themeIcon, compose: COMPOSE_MERGE},
    {theme: themeIcon, compose: COMPOSE_ASSIGN},
    {theme: themeIcon, compose: COMPOSE_REPLACE},
  ])(
    'should return passed theme as is from %p',
    (params) => {
      expect(composeTheme([params])).toStrictEqual(themeIcon);
    },
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
  const themeIcon = {
    icon: 'Icon_icon',
    svg: 'Icon_svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  };
  const themeButton = {
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
    [{theme: {...themeIcon}, compose: COMPOSE_MERGE}, {theme: {...themeButton}}],
    [{theme: {...themeIcon}, compose: COMPOSE_MERGE}, {theme: {...themeButton}, compose: COMPOSE_MERGE}],
    [{theme: {...themeIcon}, compose: COMPOSE_ASSIGN}, {theme: {...themeButton}, compose: COMPOSE_MERGE}],
    [{theme: {...themeIcon}, compose: COMPOSE_REPLACE}, {theme: {...themeButton}, compose: COMPOSE_MERGE}],
    [{theme: {...themeIcon}}, {theme: {...themeButton}, compose: COMPOSE_MERGE}],
  ])(
    'should compose by merge [%p, %p]',
    (a, b) => {
      let theme;
      const expectedResult = {
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
        expect(composeTheme([a, b])).toBe(theme)
      }

      // But second call with noCache should return a new object
      {
        theme = composeTheme([{...a, noCache: true}, {...b}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a, noCache: true}, {...b}])).not.toBe(theme);

        theme = composeTheme([{...a}, {...b, noCache: true}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a}, {...b, noCache: true}])).not.toBe(theme)
      }
    },
  );

  it('should filter and compose by merge', () => {
    let theme;
    const expectedResult = {
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
    [{theme: {...themeIcon}, compose: COMPOSE_ASSIGN}, {theme: {...themeButton}}],
    [{theme: {...themeIcon}, compose: COMPOSE_ASSIGN}, {theme: {...themeButton}, compose: COMPOSE_ASSIGN}],
    [{theme: {...themeIcon}, compose: COMPOSE_MERGE}, {theme: {...themeButton}, compose: COMPOSE_ASSIGN}],
    [{theme: {...themeIcon}, compose: COMPOSE_REPLACE}, {theme: {...themeButton}, compose: COMPOSE_ASSIGN}],
    [{theme: {...themeIcon}}, {theme: {...themeButton}, compose: COMPOSE_ASSIGN}],
  ])(
    'should compose by assign [%p, %p]',
    (a, b) => {
      let theme;
      const expectedResult = {
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
        expect(composeTheme([a, b])).toBe(theme)
      }

      // But second call with noCache should return a new object
      {
        theme = composeTheme([{...a, noCache: true}, {...b}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a, noCache: true}, {...b}])).not.toBe(theme);

        theme = composeTheme([{...a}, {...b, noCache: true}]);
        expect(theme).toStrictEqual(expectedResult);
        expect(composeTheme([{...a}, {...b, noCache: true}])).not.toBe(theme)
      }
    },
  );

  it('should filter and compose by assign', () => {
    let theme;
    const expectedResult = {
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
      small: 'Icon_small',
      medium: 'Icon_medium',
      large: 'Icon_large',
    };

    // First and second call should return the same object, because default noCache is false
    {
      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN}])).toBe(theme);
    }

    // But second call with noCache should return a new object
    {
      theme = composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN},
      ])).not.toBe(theme);

      theme = composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN, noCache: true},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_ASSIGN, noCache: true},
      ])).not.toBe(theme);
    }
  });


  it.each([
    [{theme: {...themeIcon}, compose: COMPOSE_REPLACE}, {theme: themeButton}],
    [{theme: {...themeIcon}, compose: COMPOSE_REPLACE}, {theme: themeButton, compose: COMPOSE_REPLACE}],
    [{theme: {...themeIcon}, compose: COMPOSE_MERGE}, {theme: themeButton, compose: COMPOSE_REPLACE}],
    [{theme: {...themeIcon}, compose: COMPOSE_ASSIGN}, {theme: themeButton, compose: COMPOSE_REPLACE}],
    [{theme: {...themeIcon}}, {theme: themeButton, compose: COMPOSE_REPLACE}],
  ])(
    'should compose by replace [%p, %p]',
    (...args) => {
      expect(composeTheme(args)).toBe(themeButton);
    },
  );

  it('should filter and compose by replace', () => {
    let theme;
    const expectedResult = {
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    };

    // First and second call should return the same object, because default noCache is false
    {
      theme = composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE}]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([{theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE}])).toBe(theme);
    }

    // But second call with noCache should return a new object only if noCache is set on second theme
    {
      theme = composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon, noCache: true}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE},
      ])).toBe(theme);

      theme = composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE, noCache: true},
      ]);
      expect(theme).toStrictEqual(expectedResult);
      expect(composeTheme([
        {theme: themeIcon}, {theme: themeButton, prefix: 'firstIcon-', compose: COMPOSE_REPLACE, noCache: true},
      ])).not.toBe(theme);
    }
  });
});


