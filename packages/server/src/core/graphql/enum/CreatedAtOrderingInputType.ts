import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import CreatedAtEnumType, { CREATED_AT_SORT } from './CreatedAtEnumType';
import DirectionEnumType, { DIRECTION } from './DirectionEnumType';

export type CreatedAtOrdering = {
  sort: CREATED_AT_SORT;
  direction: typeof DIRECTION;
};

const CreatedAtOrdering = new GraphQLInputObjectType({
  name: 'CreatedAtOrdering',
  description: 'Used to order by creation date',
  fields: () => ({
    sort: {
      type: new GraphQLNonNull(CreatedAtEnumType),
    },
    direction: {
      type: new GraphQLNonNull(DirectionEnumType),
    },
  }),
});

export default CreatedAtOrdering;
