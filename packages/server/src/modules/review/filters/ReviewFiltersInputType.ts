import { GraphQLInputObjectType, GraphQLList, GraphQLID, GraphQLNonNull } from 'graphql';

import { getObjectId } from '../../../common/utils';

import { FILTER_CONDITION_TYPE, FilterMapping, buildSortFromOrderByArg } from '../../../core/graphql/graphqlFilters';
import { GraphQLArgFilter, ObjectId } from '../../../types';

import ReviewOrderingInputType, { ReviewOrdering } from './ReviewOrderingInputType';

export type ReviewsArgFilters = GraphQLArgFilter<{
  orderBy?: Array<{ sort: string; direction: string }>;
  book?: ObjectId;
  user?: ObjectId;
}>;

export const reviewFilterMapping: FilterMapping = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: ReviewOrdering[]) => [{ $sort: buildSortFromOrderByArg(value) }],
  },
  book: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'bookId',
    format: (book: string) => getObjectId(book),
  },
  user: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'userId',
    format: (user: string) => getObjectId(user),
  },
};

const ReviewFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ReviewFilters',
  description: 'Used to filter reviews',
  fields: () => ({
    OR: {
      type: GraphQLList(ReviewFiltersInputType),
    },
    AND: {
      type: GraphQLList(ReviewFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(ReviewOrderingInputType)),
      description: "[{ direction: 'ASC', sort: 'CREATED_AT' }]",
    },
    book: {
      type: GraphQLID,
      description: 'Filter by book.',
    },
    user: {
      type: GraphQLID,
      description: 'Filter by user.',
    },
  }),
});

export default ReviewFiltersInputType;
