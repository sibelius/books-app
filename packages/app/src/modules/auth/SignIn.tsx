import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@booksapp/ui';

const SignIn = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Text>Sign in</Text>

      <Button type="gradient" onPress={() => navigation.navigate('SignUp')}>
        Go to sign up
      </Button>
    </View>
  );
};

export default SignIn;
