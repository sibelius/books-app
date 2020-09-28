import React from 'react';
import { View, Text } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';

import { HomeQuery } from './__generated__/HomeQuery.graphql';

const Home = () => {
  const data = useLazyLoadQuery<HomeQuery>(
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
