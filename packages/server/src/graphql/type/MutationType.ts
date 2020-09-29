import { GraphQLObjectType } from 'graphql';

import UserMutations from '../../modules/user/mutations';
import ReviewMutations from '../../modules/review/mutations';
import ReadBookMutations from '../../modules/readBook/mutations';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...UserMutations,
    ...ReviewMutations,
    ...ReadBookMutations,
  }),
});
