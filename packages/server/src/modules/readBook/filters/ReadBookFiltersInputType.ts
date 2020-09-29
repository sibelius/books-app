import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLBoolean } from 'graphql';

import CreatedAtOrderingInputType, { CreatedAtOrdering } from '../../../core/graphql/enum/CreatedAtOrderingInputType';

import { FILTER_CONDITION_TYPE, FilterMapping, buildSortFromOrderByArg } from '../../../core/graphql/graphqlFilters';

import { GraphQLArgFilter, ObjectId } from '../../../types';

export type ReadBooksArgFilters = GraphQLArgFilter<{
  orderBy?: Array<{ sort: string; direction: string }>;
  book?: ObjectId;
}>;

export const readBookFilterMapping: FilterMapping = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: CreatedAtOrdering[]) => [{ $sort: buildSortFromOrderByArg(value) }],
  },
  finished: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (finished: boolean) => {
      return [
        {
          $lookup: {
            from: 'Book',
            localField: 'bookId',
            foreignField: '_id',
            as: 'book',
          },
        },
        { $unwind: '$book' },
        {
          $project: {
            finished: {
              $switch: {
                branches: [{ case: { $eq: ['$readPages', '$book.pages'] }, then: true }],
                default: false,
              },
            },
          },
        },
        // @TODO - discover why the match directly is not working { $match: { readPages: '$book.pages' } }
        {
          $match: {
            finished,
          },
        },
      ];
    },
  },
};

const ReadBooksFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ReadBookFilters',
  description: 'Used to filter read books',
  fields: () => ({
    OR: {
      type: GraphQLList(ReadBooksFiltersInputType),
    },
    AND: {
      type: GraphQLList(ReadBooksFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(CreatedAtOrderingInputType)),
      description: "[{ direction: 'ASC', sort: 'CREATED_AT' }]",
    },
    finished: {
      type: GraphQLBoolean,
      description: 'Filter by book finished status.',
    },
  }),
});

export default ReadBooksFiltersInputType;
