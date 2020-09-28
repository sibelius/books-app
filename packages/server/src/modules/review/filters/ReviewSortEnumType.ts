import { GraphQLEnumType } from 'graphql';

export const REVIEW_SORT_MAP = {
  RATING: 'rating',
  CREATED_AT: 'createdAt',
};

export type REVIEW_SORT = 'createdAt';

export default new GraphQLEnumType({
  name: 'ReviewSortEnumType',
  values: {
    RATING: {
      value: 'rating',
      description: 'The rating of the review. ex: 4.5',
    },
    CREATED_AT: {
      value: 'createdAt',
    },
  },
});
