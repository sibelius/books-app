import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SignIn from '../modules/auth/SignIn';
import SignUp from '../modules/auth/SignUp';

const Stack = createStackNavigator();

const Auth = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} options={{ title: 'Sign in' }} />
      <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Create account' }} />
    </Stack.Navigator>
  );
};

export default Auth;
