import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import DirectionEnumType, { DIRECTION } from '../../../core/graphql/enum/DirectionEnumType';

import BookSortEnumType, { BOOK_SORT } from './BookSortEnumType';

export type BookOrdering = {
  sort: BOOK_SORT;
  direction: typeof DIRECTION;
};

const BookOrdering = new GraphQLInputObjectType({
  name: 'BookOrdering',
  description: 'Used to order books',
  fields: () => ({
    sort: {
      type: new GraphQLNonNull(BookSortEnumType),
    },
    direction: {
      type: new GraphQLNonNull(DirectionEnumType),
    },
  }),
});

export default BookOrdering;
