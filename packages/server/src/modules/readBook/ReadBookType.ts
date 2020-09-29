import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLNonNull, GraphQLInt } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import BookType from '../book/BookType';
import { BookLoader } from '../../loader';

import ReadBook from './ReadBookLoader';

type ConfigType = GraphQLObjectTypeConfig<ReadBook, GraphQLContext>;

const ReadBookTypeConfig: ConfigType = {
  name: 'ReadBook',
  description: 'Represents a ReadBook',
  fields: () => ({
    id: globalIdField('ReadBook'),
    ...mongooseIdResolver,
    book: {
      type: BookType,
      description: 'The book being read.',
      resolve: async (obj, args, context) => await BookLoader.load(context, obj.bookId),
    },
    readPages: {
      type: GraphQLInt,
      description: 'The total read pages. ex: 50',
      resolve: (obj) => obj.readPages,
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const ReadBookType = registerType(new GraphQLObjectType(ReadBookTypeConfig));

export const ReadBookConnection = connectionDefinitions({
  name: 'ReadBook',
  nodeType: GraphQLNonNull(ReadBookType),
});

export default ReadBookType;
