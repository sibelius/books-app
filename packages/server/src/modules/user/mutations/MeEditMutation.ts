import { GraphQLString } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';

import * as UserLoader from '../UserLoader';
import UserModel from '../UserModel';
import UserType from '../UserType';
import { LoggedGraphQLContext } from '../../../types';
import errorField from '../../../core/graphql/errorField';

interface MeEditMutationArgs {
  name?: string;
  lang?: string;
}

const mutation = mutationWithClientMutationId({
  name: 'MeEdit',
  inputFields: {
    name: {
      type: GraphQLString,
      description: 'User name. ex: Jean',
    },
    lang: {
      type: GraphQLString,
      description: 'Language of the user. ex: pt',
    },
  },
  mutateAndGetPayload: async (args: MeEditMutationArgs, context: LoggedGraphQLContext) => {
    const { name, lang } = args;
    const { user, t } = context;

    const userNewInfo = {
      ...(name ? { name } : {}),
      ...(lang ? { lang } : {}),
    };

    const updatedUser = await UserModel.findOneAndUpdate({ _id: user._id }, userNewInfo);

    if (!updatedUser) {
      return {
        id: null,
        error: t('auth', 'UserNotFound'),
      };
    }

    UserLoader.clearAndPrimeCache(context, updatedUser._id, updatedUser);

    return {
      id: updatedUser._id,
      error: null,
    };
  },
  outputFields: {
    me: {
      type: UserType,
      resolve: async ({ id }, _, context) => {
        const newUser = await UserLoader.load(context, id);

        if (!newUser) {
          return null;
        }

        return newUser;
      },
    },
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
