import {getThemeFromProps, mixThemeWithProps, COMPOSE_MERGE, COMPOSE_ASSIGN, COMPOSE_REPLACE} from './index';

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

it('getThemeFromProps should prefix and compose by merge from props', () => {
  expect(getThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: COMPOSE_MERGE}))
    .toStrictEqual({
      icon: 'Icon_icon Button_firstIcon-icon',
      svg: 'Icon_svg Button_firstIcon-svg',
      small: 'Icon_small',
      medium: 'Icon_medium',
      large: 'Icon_large',
    });
});

it('getThemeFromProps should prefix and compose by assign from props', () => {
  expect(getThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: COMPOSE_ASSIGN}))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
      small: 'Icon_small',
      medium: 'Icon_medium',
      large: 'Icon_large',
    });
});

it('getThemeFromProps should prefix and compose by assign from props', () => {
  expect(getThemeFromProps(themeIcon, {theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: COMPOSE_REPLACE}))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    });
});

it('getThemeFromProps should prefix and compose by assign from props', () => {
  expect(getThemeFromProps(themeIcon, [{theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: COMPOSE_REPLACE}]))
    .toStrictEqual({
      icon: 'Button_firstIcon-icon',
      svg: 'Button_firstIcon-svg',
    });
});

it('mixThemeWithProps should return prefixed and composed theme', () => {
  const {theme, themePrefix, themeCompose, themeNoCache, ...restProps} = mixThemeWithProps(themeIcon, {
    prop: 'SomePropValue',
    theme: {...themeButton}, themePrefix: 'firstIcon-', themeCompose: COMPOSE_MERGE
  });

  expect(theme).toStrictEqual({
    icon: 'Icon_icon Button_firstIcon-icon',
    svg: 'Icon_svg Button_firstIcon-svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  });
  expect(restProps).toStrictEqual({prop: 'SomePropValue'});
  expect(themePrefix).not.toBeDefined();
  expect(themeCompose).not.toBeDefined();
  expect(themeNoCache).not.toBeDefined();
});

it('mixThemeWithProps with context and option props', () => {
  const context = {
    theme: {
      icon: 'Context_icon',
      svg: 'Context_svg',
    }
  };
  const props = {
    prop: 'SomePropValue',
    theme: {...themeButton}, themePrefix: 'firstIcon-',
  };
  const {theme, themePrefix, themeCompose, themeNoCache, ...restProps} = mixThemeWithProps(
    themeIcon, [context, props], {props}
  );

  expect(theme).toStrictEqual({
    icon: 'Icon_icon Context_icon Button_firstIcon-icon',
    svg: 'Icon_svg Context_svg Button_firstIcon-svg',
    small: 'Icon_small',
    medium: 'Icon_medium',
    large: 'Icon_large',
  });
  expect(restProps).toStrictEqual({prop: 'SomePropValue'});
  expect(themePrefix).not.toBeDefined();
  expect(themeCompose).not.toBeDefined();
  expect(themeNoCache).not.toBeDefined();
});
