import 'react-native-gesture-handler';
import React from 'react';
//import { ThemeProvider } from 'styled-components';

//import { ErrorBoundary, theme } from '@booksapp/ui';

import Router from './router/Router';

const App = () => {
  return (
    <>
      {/* <ErrorBoundary> */}
      {/* <ThemeProvider theme={theme}> */}
      <Router />
      {/* </ThemeProvider> */}
      {/* </ErrorBoundary> */}
    </>
  );
};

export default App;
