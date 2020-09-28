import 'react-native-gesture-handler';
import React from 'react';
import { Text } from 'react-native';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
//import { ThemeProvider } from 'styled-components';

//import { ErrorBoundary, theme } from '@booksapp/ui';

import { Environment } from '@booksapp/relay';

import ErrorBoundary from './modules/common/ErrorBoundary';
import Router from './router/Router';

const App = () => {
  return (
    <RelayEnvironmentProvider environment={Environment}>
      {/* <ThemeProvider theme={theme}> */}
      <ErrorBoundary>
        <React.Suspense fallback={<Text>loading suspense</Text>}>
          <Router />
        </React.Suspense>
      </ErrorBoundary>
      {/* </ThemeProvider> */}
    </RelayEnvironmentProvider>
  );
};

export default App;
