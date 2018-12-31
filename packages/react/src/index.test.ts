import {composeThemeFromProps, mixThemeWithProps, Compose} from '.';

const themeIcon = {
  icon: 'Icon_icon',
  svg: 'Icon_svg',
  small: 'Icon_small Icon_icon',
  medium: 'Icon_medium Icon_icon',
  large: 'Icon_large Icon_icon',
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

it('composeThemeFromProps should prefix and compose by merge from props', () => {
  expect(composeThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: Compose.Merge}))
    .toStrictEqual({
      icon: 'Icon_icon Button_firstIcon-icon',
      svg: 'Icon_svg Button_firstIcon-svg',
      small: 'Icon_small Icon_icon Button_firstIcon-icon',
      medium: 'Icon_medium Icon_icon Button_firstIcon-icon',
      large: 'Icon_large Icon_icon Button_firstIcon-icon',
    });
});

it('composeThemeFromProps should prefix and compose by assign from props', () => {
  expect(composeThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: Compose.Assign}))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
      small: 'Icon_small Button_firstIcon-icon',
      medium: 'Icon_medium Button_firstIcon-icon',
      large: 'Icon_large Button_firstIcon-icon',
    });
});

it('composeThemeFromProps should prefix and compose by replace from props', () => {
  expect(composeThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: Compose.Replace}))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    });
});

it('composeThemeFromProps should prefix and compose by replace from props', () => {
  expect(composeThemeFromProps(themeIcon, [{theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: Compose.Replace}]))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    });
});

it('mixThemeWithProps should return prefixed and composed theme', () => {
  const {
    theme,
    // @ts-ignore Test that theme* props really do not exist
    themePrefix, themeCompose, themeNoCache, themeNoParseComposes,
    ...restProps
  } = mixThemeWithProps(themeIcon, {
    prop: 'SomePropValue',
    theme: {...themeButton}, themePrefix: 'firstIcon-',
    themeCompose: Compose.Merge, themeNoCache: true, themeNoParseComposes: true,
  });

  expect(theme).toStrictEqual({
    icon: 'Icon_icon Button_firstIcon-icon',
    svg: 'Icon_svg Button_firstIcon-svg',
    small: 'Icon_small Icon_icon',
    medium: 'Icon_medium Icon_icon',
    large: 'Icon_large Icon_icon',
  });
  expect(restProps).toStrictEqual({prop: 'SomePropValue'});
  expect(themePrefix).not.toBeDefined();
  expect(themeCompose).not.toBeDefined();
  expect(themeNoCache).not.toBeDefined();
  expect(themeNoParseComposes).not.toBeDefined();
});

it('mixThemeWithProps with context and option props', () => {
  const context = {
    theme: {
      icon: 'Context_icon',
      svg: 'Context_svg',
    },
  };
  const props = {
    id: 'SomePropValue',
    theme: {...themeButton}, themePrefix: 'firstIcon-',
  };
  const {
    theme,
    // @ts-ignore Test that theme* props really do not exist
    themePrefix, themeCompose, themeNoCache,
    ...restProps
  } = mixThemeWithProps(themeIcon, [context, props], {props});

  expect(theme).toStrictEqual({
    icon: 'Icon_icon Context_icon Button_firstIcon-icon',
    svg: 'Icon_svg Context_svg Button_firstIcon-svg',
    small: 'Icon_small Icon_icon Context_icon Button_firstIcon-icon',
    medium: 'Icon_medium Icon_icon Context_icon Button_firstIcon-icon',
    large: 'Icon_large Icon_icon Context_icon Button_firstIcon-icon',
  });
  expect(restProps).toStrictEqual({id: 'SomePropValue'});
  expect(themePrefix).not.toBeDefined();
  expect(themeCompose).not.toBeDefined();
  expect(themeNoCache).not.toBeDefined();
});
