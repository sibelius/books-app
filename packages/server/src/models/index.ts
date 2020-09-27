import mongoose from 'mongoose';

import User, { IUser } from '../modules/user/UserModel';
import SessionToken, { ISessionToken, SESSION_TOKEN_SCOPES } from '../modules/sessionToken/SessionTokenModel';

mongoose.Promise = global.Promise;

export { User, IUser, SessionToken, ISessionToken, SESSION_TOKEN_SCOPES };
