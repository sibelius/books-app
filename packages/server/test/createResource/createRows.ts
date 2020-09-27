import { DeepPartial } from '@booksapp/types';

import { ISessionToken, IUser, SESSION_TOKEN_SCOPES, SessionToken, User } from '../../src/models';

import { getObjectId, PLATFORM } from '../../src/common/utils';

import { getOrCreate } from './helpers';

export const createUser = async (args: DeepPartial<IUser> = {}): Promise<IUser> => {
  const n = (global.__COUNTERS__.user += 1);
  const { name, email, password, wasVerified, ...rest } = args;

  return new User({
    name: name || `User #${n}`,
    email: email || { email: `user${n}@example.com`, wasVerified: true },
    password: password || '123456789',
    ...rest,
  }).save();
};

export const createSessionToken = async (args: DeepPartial<ISessionToken> = {}) => {
  const { user, ip = '::ffff:127.0.0.1', channel, scope, ...rest } = args;

  return new SessionToken({
    ...(user ? { user: getObjectId(user) } : {}),
    ip,
    channel: channel || PLATFORM.APP,
    scope: scope || SESSION_TOKEN_SCOPES.SESSION,
    ...rest,
  }).save();
};
