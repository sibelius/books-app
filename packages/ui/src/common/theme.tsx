const theme = {
  colors: {
    primary: '#FF9900',
    accent: '#FF590D',
    black: '#222222',
    background: '#F5F5F5',
    white: '#ffffff',
    text: '#666666',
    confirm: '#0E547F',
    warning: '#B30302',
    link: '#276EF1',
  },
  fontSizes: {
    h1: '50px',
    h2: '35px',
    h3: '20px',
    button: '18px',
    label: '16px',
    text: '14px',
  },
  fontWeights: {
    regular: '400',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
};

// @TODO - improve type
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      accent: string;
      black: string;
      background: string;
      white: string;
      text: string;
      confirm: string;
      warning: string;
      link: string;
    };
    fontSizes: {
      h1: string;
      h2: string;
      h3: string;
      button: string;
      text: string;
      label: string;
    };
    fontWeights: {
      regular: string;
      semiBold: string;
      bold: string;
      extraBold: string;
    };
  }
}

export default theme;
