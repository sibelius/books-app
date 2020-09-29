import { GraphQLEnumType } from 'graphql';

export const CREATED_AT_SORT_MAP = {
  CREATED_AT: 'createdAt',
};

export type CREATED_AT_SORT = 'createdAt';

export default new GraphQLEnumType({
  name: 'CreatedAtSortEnumType',
  values: {
    CREATED_AT: {
      value: 'createdAt',
    },
  },
});
