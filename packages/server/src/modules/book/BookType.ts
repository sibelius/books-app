import {
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import { ReviewLoader } from '../../loader';

import Book from './BookLoader';

type ConfigType = GraphQLObjectTypeConfig<Book, GraphQLContext>;

const BookTypeConfig: ConfigType = {
  name: 'Book',
  description: 'Represents a Book',
  fields: () => ({
    id: globalIdField('Book'),
    ...mongooseIdResolver,
    name: {
      type: GraphQLString,
      description: 'The book name. ex: O Alienista',
      resolve: (obj) => obj.name,
    },
    author: {
      type: GraphQLString,
      description: 'The book author. ex: Machado de Assis',
      resolve: (obj) => obj.author,
    },
    description: {
      type: GraphQLString,
      description: 'The book description.',
      resolve: (obj) => obj.description,
    },
    releaseYear: {
      type: GraphQLInt,
      description: 'The book release year. ex: 1882',
      resolve: (obj) => obj.releaseYear,
    },
    pages: {
      type: GraphQLInt,
      description: 'The book total page. ex: 96',
      resolve: (obj) => obj.pages,
    },
    bannerUrl: {
      type: GraphQLString,
      description: 'The book banner url.',
      resolve: (obj) => obj.bannerUrl,
    },
    ISBN: {
      type: GraphQLInt,
      description: 'The book banner ISBN. ex: 9780850515060',
      resolve: (obj) => obj.ISBN,
    },
    language: {
      type: GraphQLString,
      description: 'The book language. ex: Portuguese',
      resolve: (obj) => obj.language,
    },
    rating: {
      type: GraphQLFloat,
      description: 'The book average rating based on user reviews',
      resolve: (obj, args, context) => ReviewLoader.loadBookAverageRating(context, obj._id),
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const BookType = registerType(new GraphQLObjectType(BookTypeConfig));

export const BookConnection = connectionDefinitions({
  name: 'Book',
  nodeType: GraphQLNonNull(BookType),
});

export default BookType;
