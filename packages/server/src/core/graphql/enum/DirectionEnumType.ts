import { GraphQLEnumType } from 'graphql';

export const DIRECTION = {
  ASC: 1,
  DESC: -1,
};

export default new GraphQLEnumType({
  name: 'DirectionEnum',
  values: {
    ASC: {
      value: 1,
    },
    DESC: {
      value: -1,
    },
  },
});
