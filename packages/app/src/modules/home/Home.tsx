import React from 'react';
import { View, Text } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';

const Home = () => {
  const data = useLazyLoadQuery(
    graphql`
      query HomeQuery {
        me {
          name
        }
      }
    `,
    {},
  );

  return (
    <View>
      <Text>Home</Text>
    </View>
  );
};

export default Home;
