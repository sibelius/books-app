import { GraphQLObjectType, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionArgs } from 'graphql-relay';

import { NodeField, NodesField } from '../../interface/NodeInterface';

import { GraphQLContext } from '../../types';

import UserType from '../../modules/user/UserType';

import { UserLoader, BookLoader } from '../../loader';

import { BookConnection } from '../../modules/book/BookType';
import BookFiltersInputType from '../../modules/book/filters/BookFiltersInputType';

import StatusType from './StatusType';

export default new GraphQLObjectType<any, GraphQLContext, any>({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    id: globalIdField('Query'),
    node: NodeField,
    nodes: NodesField,
    me: {
      type: UserType,
      description: 'Me is the logged User',
      resolve: (_, __, context: GraphQLContext) => UserLoader.load(context, context.user && context.user.id),
    },
    status: {
      type: StatusType,
      resolve: () => ({}),
    },

    books: {
      type: GraphQLNonNull(BookConnection.connectionType),
      description: 'Connection to all books',
      args: {
        ...connectionArgs,
        filters: {
          type: BookFiltersInputType,
        },
      },
      resolve: (obj, args, context) => BookLoader.loadBooks(context, args),
    },
  }),
});
