import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import CreatedAtOrderingInputType, { CreatedAtOrdering } from '../../../core/graphql/enum/CreatedAtOrderingInputType';

import { FILTER_CONDITION_TYPE, FilterMapping, buildSortFromOrderByArg } from '../../../core/graphql/graphqlFilters';
import { GraphQLArgFilter } from '../../../types';

export type CategoriesArgFilters = GraphQLArgFilter<{
  orderBy?: Array<{ sort: string; direction: string }>;
}>;

export const categoryFilterMapping: FilterMapping = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: CreatedAtOrdering[]) => [{ $sort: buildSortFromOrderByArg(value) }],
  },
};

const CategoryFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CategoryFilters',
  description: 'Used to filter categories',
  fields: () => ({
    OR: {
      type: GraphQLList(CategoryFiltersInputType),
    },
    AND: {
      type: GraphQLList(CategoryFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(CreatedAtOrderingInputType)),
      description: "[{ direction: 'ASC', sort: 'CREATED_AT' }]",
    },
  }),
});

export default CategoryFiltersInputType;
