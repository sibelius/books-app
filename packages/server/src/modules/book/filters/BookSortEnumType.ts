import { GraphQLEnumType } from 'graphql';

export const BOOK_SORT_MAP = {
  CREATED_AT: 'createdAt',
};

export type BOOK_SORT = 'createdAt';

export default new GraphQLEnumType({
  name: 'BookSortEnumType',
  values: {
    CREATED_AT: {
      value: 'createdAt',
    },
  },
});
