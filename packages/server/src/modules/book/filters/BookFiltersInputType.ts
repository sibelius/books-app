import { GraphQLInputObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID } from 'graphql';

import { FILTER_CONDITION_TYPE, FilterMapping, buildSortFromOrderByArg } from '../../../core/graphql/graphqlFilters';
import { escapeRegex, getObjectId } from '../../../common/utils';
import { GraphQLArgFilter, ObjectId } from '../../../types';

import BookOrderingInputType, { BookOrdering } from './BookOrderingInputType';

export type BooksArgFilters = GraphQLArgFilter<{
  orderBy?: Array<{ sort: string; direction: string }>;
  search?: string;
  category: ObjectId;
}>;

export const bookFilterMapping: FilterMapping = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: BookOrdering[]) => [{ $sort: buildSortFromOrderByArg(value) }],
  },
  search: {
    type: FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
    key: 'name',
    format: (value: string) => {
      if (!value) return {};

      const safeSearch = escapeRegex(value);
      const searchRegex = new RegExp(`${safeSearch}`, 'ig');

      return {
        $or: [
          { name: { $regex: searchRegex } },
          { author: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
      };
    },
  },
  category: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'categoryId',
    format: (category: string) => getObjectId(category),
  },
};

const BookFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'BookFilters',
  description: 'Used to filter books',
  fields: () => ({
    OR: {
      type: GraphQLList(BookFiltersInputType),
    },
    AND: {
      type: GraphQLList(BookFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(BookOrderingInputType)),
      description: "[{ direction: 'ASC', sort: 'CREATED_AT' }]",
    },
    search: {
      type: GraphQLString,
      description: 'Filter by search string. Name, author or description.',
    },
    category: {
      type: GraphQLID,
      description: 'Filter by category.',
    },
  }),
});

export default BookFiltersInputType;
