import React, { useReducer, useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
//import SplashScreen from 'react-native-splash-screen';

import { AUTH_KEY } from '../common/config';

import AuthContext from './AuthContext';

import Auth from './AuthRouter';
import App from './AppRouter';

const Router = () => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            isSigin: true,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isLoading: false,
            isSigin: true,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isLoading: false,
            isSigin: false,
          };
      }
    },
    {
      isLoading: true,
      isSigin: false,
    },
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      const userToken = await AsyncStorage.getItem(AUTH_KEY);

      if (userToken) {
        dispatch({ type: 'RESTORE_TOKEN' });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      //SplashScreen.hide();
    }
  }, [state.isLoading]);

  const authContext = useMemo(
    () => ({
      signIn: async (token: string) => {
        await AsyncStorage.setItem(AUTH_KEY, token);
        dispatch({ type: 'SIGN_IN' });
      },
      signOut: async () => {
        await AsyncStorage.removeItem(AUTH_KEY);
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async (token: string) => {
        await AsyncStorage.setItem(AUTH_KEY, token);
        dispatch({ type: 'SIGN_IN' });
      },
    }),
    [],
  );

  if (state.isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>{!state.isSigin ? <Auth /> : <App />}</NavigationContainer>
    </AuthContext.Provider>
  );
};

export default Router;
