import React from 'react';
import { Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Sign up</Text>
      <Button title="Go to sign in" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
};

export default SignUp;
