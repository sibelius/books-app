import React from 'react';
import { Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignIn = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Text>Sign in</Text>
      <Button title="Go to sign up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
};

export default SignIn;
