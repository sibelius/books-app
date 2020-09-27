import common, { Keys as CommonKeys } from './common';
import auth, { Keys as AuthKeys } from './auth';

const namespaces = {
  common,
  auth,
};

export default namespaces;

export type NamespaceKeys = keyof typeof namespaces;

export type MessageKeys = CommonKeys | AuthKeys;
