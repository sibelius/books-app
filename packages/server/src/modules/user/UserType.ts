import { GraphQLBoolean, GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { NodeInterface, registerType } from '../../interface/NodeInterface';

import { GraphQLContext } from '../../types';

import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';

import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import User from './UserLoader';

type ConfigType = GraphQLObjectTypeConfig<User, GraphQLContext>;

const UserTypeConfig: ConfigType = {
  name: 'User',
  description: 'Represents an user',
  fields: () => ({
    id: globalIdField('User'),
    ...mongooseIdResolver,
    name: {
      type: GraphQLString,
      description: 'User name resolver',
      resolve: (user) => user.name,
    },
    surname: {
      type: GraphQLString,
      description: 'User surname resolver',
      resolve: (user) => user.surname,
    },
    fullName: {
      type: GraphQLString,
      description: 'User name resolver',
      resolve: (user) => (user.surname ? `${user.name} ${user.surname}` : user.name),
    },
    email: {
      type: GraphQLString,
      description: 'User email resolver',
      resolve: (user) => user.email.email,
    },
    emailWasVerified: {
      type: GraphQLString,
      description: 'User email resolver',
      resolve: (user) => user.email.wasVerified,
    },
    lang: {
      type: GraphQLString,
      resolve: (obj) => obj.lang,
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const UserType = registerType(new GraphQLObjectType(UserTypeConfig));

export default UserType;
