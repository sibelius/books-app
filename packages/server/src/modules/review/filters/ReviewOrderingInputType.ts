import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import DirectionEnumType, { DIRECTION } from '../../../core/graphql/enum/DirectionEnumType';

import ReviewSortEnumType, { REVIEW_SORT } from './ReviewSortEnumType';

export type ReviewOrdering = {
  sort: REVIEW_SORT;
  direction: typeof DIRECTION;
};

const ReviewOrdering = new GraphQLInputObjectType({
  name: 'ReviewOrdering',
  description: 'Used to order reviews',
  fields: () => ({
    sort: {
      type: new GraphQLNonNull(ReviewSortEnumType),
    },
    direction: {
      type: new GraphQLNonNull(DirectionEnumType),
    },
  }),
});

export default ReviewOrdering;
